#!/usr/bin/env ts-node

/**
 * Production-safe migration runner
 */

import { exec } from 'child_process';
import readline from 'readline';
import { Pool } from 'pg';
import 'dotenv/config';

const args = process.argv.slice(2);
const command = args[0] || 'status';
const isDryRun = args.includes('--dry') || args.includes('-d');
const isForce = args.includes('--force') || args.includes('-f');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crypto_wallet',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT version()');
    log('Connected to PostgreSQL', 'green');
    return true;
  } catch (error) {
    log(`Database connection failed: ${(error as Error).message}`, 'red');
    return false;
  }
}

interface Migration {
  name: string;
  run_on: Date;
}

interface MigrationStatus {
  applied: Migration[];
  pending?: string;
  error?: string;
}

async function getMigrationStatus(): Promise<MigrationStatus> {
  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'pgmigrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return { applied: [], pending: 'unknown' };
    }

    const result = await pool.query(`
      SELECT name, run_on
      FROM pgmigrations
      ORDER BY run_on DESC
    `);

    return { applied: result.rows, pending: 'check files' };
  } catch (error) {
    return { applied: [], error: (error as Error).message };
  }
}

async function showStatus(): Promise<void> {
  log('\nMigration Status', 'cyan');
  log('─'.repeat(50));

  const status = await getMigrationStatus();

  if (status.error) {
    log(`Error: ${status.error}`, 'red');
    return;
  }

  if (status.applied.length === 0) {
    log('No migrations have been applied yet.', 'yellow');
  } else {
    log(`\nApplied migrations (${status.applied.length}):`, 'green');
    status.applied.forEach(m => {
      const date = new Date(m.run_on).toISOString().split('T')[0];
      log(`  - ${m.name} (${date})`);
    });
  }

  log('\nRun "npm run migrate:up" to apply pending migrations.', 'blue');
}

function runMigration(direction: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dryRunFlag = isDryRun ? '--dry-run' : '';
    const cmd = `npx node-pg-migrate ${direction} ${dryRunFlag} -f src/config/migrate.config.js`;

    log(`\nRunning: ${cmd}`, 'cyan');

    if (isDryRun) {
      log('(DRY RUN - no changes will be made)', 'yellow');
    }

    const child = exec(cmd, { cwd: process.cwd() });

    child.stdout?.on('data', data => process.stdout.write(data));
    child.stderr?.on('data', data => process.stderr.write(data));

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Migration failed with code ${code}`));
      }
    });
  });
}

async function promptConfirmation(message: string): Promise<boolean> {
  if (isForce) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function main(): Promise<void> {
  log('\nDatabase Migration Tool', 'cyan');
  log('═'.repeat(50));

  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }

  switch (command) {
    case 'status':
      await showStatus();
      break;

    case 'up':
      if (!isDryRun && process.env.NODE_ENV === 'production') {
        log('\nPRODUCTION MIGRATION', 'yellow');
        log('Make sure you have a recent backup!', 'yellow');

        const confirmed = await promptConfirmation('Continue with migration?');
        if (!confirmed) {
          log('Migration cancelled.', 'red');
          process.exit(0);
        }
      }
      await runMigration('up');
      log('\nMigration completed successfully!', 'green');
      break;

    case 'down':
      log('\nROLLBACK WARNING', 'yellow');
      log('This will undo the last migration.', 'yellow');

      const confirmed = await promptConfirmation('Continue with rollback?');
      if (!confirmed) {
        log('Rollback cancelled.', 'red');
        process.exit(0);
      }
      await runMigration('down');
      log('\nRollback completed successfully!', 'green');
      break;

    default:
      log(`Unknown command: ${command}`, 'red');
      log('\nUsage: ts-node scripts/migrate.ts [command] [options]');
      log('Commands: up, down, status');
      log('Options: --dry, --force');
      process.exit(1);
  }

  await pool.end();
}

main().catch(error => {
  log(`\nError: ${(error as Error).message}`, 'red');
  process.exit(1);
});
