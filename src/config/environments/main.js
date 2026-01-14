/**
 * Main environment configuration
 * Used for main branch deployments (pre-production/staging)
 * Branch: main
 *
 * Neon Database: Use a separate branch for main/staging
 * https://neon.tech/docs/manage/branches
 */
const base = require('./base');

module.exports = {
  ...base,
  env: 'main',
  debug: false,
  db: {
    // Neon connection string format:
    // postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
    },
    max: 15,
    idleTimeoutMillis: 25000,
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
      process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
    ].flat().filter(Boolean),
  },
  logging: {
    level: 'info',
    format: 'combined',
  },
  security: {
    helmet: true,
    rateLimit: {
      ...base.api.rateLimit,
      max: 75,
    },
  },
};
