#!/usr/bin/env ts-node

import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function testConnection(): Promise<void> {
  try {
    console.log('Testing PostgreSQL connection...');
    const result = await pool.query('SELECT version()');
    console.log('PostgreSQL is running!');
    console.log('Version:', result.rows[0].version);
    await pool.end();
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error('Connection failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nPostgreSQL is not running. Please start the service.');
    }
    process.exit(1);
  }
}

testConnection();
