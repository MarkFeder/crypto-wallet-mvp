#!/usr/bin/env node

/**
 * Production-safe migration runner
 *
 * Features:
 * - Pre-flight checks (connection, pending migrations)
 * - Dry-run mode
 * - Backup reminder
 * - Detailed logging
 *
 * Usage:
 *   node scripts/migrate.js up          # Run pending migrations
 *   node scripts/migrate.js down        # Rollback last migration
 *   node scripts/migrate.js status      # Show migration status
 *   node scripts/migrate.js up --dry    # Preview without executing
 */

const { exec } = require('child_process');
const { Pool } = require('pg');
require('dotenv').config();

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkConnection() {
  try {
    const result = await pool.query('SELECT version()');
    log(`Connected to PostgreSQL`, 'green');
    return true;
  } catch (error) {
    log(`Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function getMigrationStatus() {
  try {
    // Check if migrations table exists
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
    return { applied: [], error: error.message };
  }
}

async function showStatus() {
  log('\n📊 Migration Status', 'cyan');
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
    status.applied.forEach((m) => {
      const date = new Date(m.run_on).toISOString().split('T')[0];
      log(`  ✓ ${m.name} (${date})`);
    });
  }

  log('\nRun "npm run migrate:up" to apply pending migrations.', 'blue');
}

function runMigration(direction) {
  return new Promise((resolve, reject) => {
    const dryRunFlag = isDryRun ? '--dry-run' : '';
    const cmd = `npx node-pg-migrate ${direction} ${dryRunFlag} -f migrate.config.js`;

    log(`\n🚀 Running: ${cmd}`, 'cyan');

    if (isDryRun) {
      log('(DRY RUN - no changes will be made)', 'yellow');
    }

    const child = exec(cmd, { cwd: process.cwd() });

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Migration failed with code ${code}`));
      }
    });
  });
}

async function promptConfirmation(message) {
  if (isForce) return true;

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function main() {
  log('\n🔄 Database Migration Tool', 'cyan');
  log('═'.repeat(50));

  // Pre-flight checks
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
        log('\n⚠️  PRODUCTION MIGRATION', 'yellow');
        log('Make sure you have a recent backup!', 'yellow');

        const confirmed = await promptConfirmation('Continue with migration?');
        if (!confirmed) {
          log('Migration cancelled.', 'red');
          process.exit(0);
        }
      }
      await runMigration('up');
      log('\n✅ Migration completed successfully!', 'green');
      break;

    case 'down':
      log('\n⚠️  ROLLBACK WARNING', 'yellow');
      log('This will undo the last migration.', 'yellow');

      const confirmed = await promptConfirmation('Continue with rollback?');
      if (!confirmed) {
        log('Rollback cancelled.', 'red');
        process.exit(0);
      }
      await runMigration('down');
      log('\n✅ Rollback completed successfully!', 'green');
      break;

    case 'redo':
      log('\n🔄 Redo: Rolling back and reapplying last migration', 'cyan');
      await runMigration('down');
      await runMigration('up');
      log('\n✅ Redo completed successfully!', 'green');
      break;

    default:
      log(`Unknown command: ${command}`, 'red');
      log('\nUsage: node scripts/migrate.js [command] [options]');
      log('Commands: up, down, status, redo');
      log('Options: --dry, --force');
      process.exit(1);
  }

  await pool.end();
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
