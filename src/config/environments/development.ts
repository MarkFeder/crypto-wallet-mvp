/**
 * Development environment configuration
 * Used for local development and Vercel Development environment
 */
import base from './base';

const development = {
  ...base,
  env: 'development' as const,
  debug: true,
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'crypto_wallet_dev',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: false as const,
  },
  jwt: {
    ...base.jwt,
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },
  client: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  },
  cors: {
    ...base.cors,
    origin: ['http://localhost:3000', 'http://localhost:5000'],
  },
  logging: {
    level: 'debug',
    format: 'dev',
  },
};

export default development;
