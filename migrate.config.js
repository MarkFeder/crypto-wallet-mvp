require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL || {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'crypto_wallet',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
  direction: 'up',
  count: Infinity,
  timestamp: true,
  verbose: true,
  decamelize: true,
};
