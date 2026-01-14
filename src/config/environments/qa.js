/**
 * QA environment configuration
 * Used for QA/testing deployments
 * Branch: qa
 *
 * Neon Database: Use a separate branch for QA
 * https://neon.tech/docs/manage/branches
 */
const base = require('./base');

module.exports = {
  ...base,
  env: 'qa',
  debug: true,
  db: {
    // Neon connection string format:
    // postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
    },
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 5000,
  },
  jwt: {
    ...base.jwt,
    secret: process.env.JWT_SECRET,
  },
  client: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  cors: {
    ...base.cors,
    origin: [
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null,
    ].filter(Boolean),
  },
  logging: {
    level: 'debug',
    format: 'combined',
  },
};
