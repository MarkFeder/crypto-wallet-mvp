const path = require('path');
require('dotenv').config();

// Root directory (two levels up from src/config)
const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  databaseUrl: process.env.DATABASE_URL || {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'crypto_wallet',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  migrationsTable: 'pgmigrations',
  dir: path.resolve(rootDir, 'migrations'),
  direction: 'up',
  count: Infinity,
  timestamp: true,
  verbose: true,
  decamelize: true,
};
