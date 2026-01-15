#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { pool } from '../src/server/config/db';

async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('Starting database initialization...');
    console.log('Connected to database:', process.env.DB_NAME || 'crypto_wallet');

    // Read schema file
    const schemaPath = path.join(__dirname, '../src/server/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema from:', schemaPath);

    // Begin transaction
    await client.query('BEGIN');

    // Execute schema
    await client.query(schema);

    // Commit transaction
    await client.query('COMMIT');

    console.log('Database schema created successfully!');

    // Verify tables
    const tableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('Created tables:');
    tableCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\nDatabase initialization completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    const err = error as Error & { code?: string };
    console.error('\nDatabase initialization failed:', err.message);

    if (err.code === 'ECONNREFUSED') {
      console.error('\nConnection refused. Please check:');
      console.error('   - PostgreSQL is running');
      console.error('   - Database credentials in .env file are correct');
    } else if (err.code === '3D000') {
      console.error('\nDatabase does not exist. Please create it first:');
      console.error(`   createdb ${process.env.DB_NAME || 'crypto_wallet'}`);
    }

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log('\nExiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
