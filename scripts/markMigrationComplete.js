#!/usr/bin/env node

/**
 * Mark a migration as complete without running it
 *
 * Use this for existing databases that already have the schema
 * but need to start tracking migrations.
 *
 * Usage:
 *   node scripts/markMigrationComplete.js 1736780400000_initial-schema
 */

const { Pool } = require('pg');
require('dotenv').config();

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: node scripts/markMigrationComplete.js <migration-name>');
  console.error('Example: node scripts/markMigrationComplete.js 1736780400000_initial-schema');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crypto_wallet',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function main() {
  console.log(`\nMarking migration as complete: ${migrationName}`);

  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pgmigrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if already marked
    const existing = await pool.query(
      'SELECT * FROM pgmigrations WHERE name = $1',
      [migrationName]
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Migration already marked as complete.');
      process.exit(0);
    }

    // Insert the migration record
    await pool.query(
      'INSERT INTO pgmigrations (name, run_on) VALUES ($1, CURRENT_TIMESTAMP)',
      [migrationName]
    );

    console.log('✅ Migration marked as complete!');
    console.log('\nNote: The migration code was NOT executed.');
    console.log('Use this only for databases that already have the schema.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
