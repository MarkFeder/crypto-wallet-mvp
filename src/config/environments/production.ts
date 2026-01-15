/**
 * Production environment configuration
 * Used for Vercel Production deployments (main branch)
 *
 * Neon Database: Use the main branch for production
 * https://neon.tech/docs/manage/branches
 */
import base from './base';

const production = {
  ...base,
  env: 'production' as const,
  debug: false,
  db: {
    // Neon connection string format:
    // postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true, // Neon uses valid SSL certificates
    },
    // Neon serverless - optimized pool settings for production
    max: 20,
    idleTimeoutMillis: 30000,
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
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['https://your-production-domain.com'],
  },
  logging: {
    level: 'warn',
    format: 'combined',
  },
  security: {
    helmet: true,
    rateLimit: {
      ...base.api.rateLimit,
      max: 50, // Stricter rate limiting in production
    },
  },
};

export default production;
