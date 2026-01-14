/**
 * Base configuration - shared across all environments
 * These values can be overridden by environment-specific configs
 */
module.exports = {
  app: {
    name: 'crypto-wallet-mvp',
    port: process.env.PORT || 5000,
  },
  jwt: {
    expiresIn: '24h',
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  cors: {
    credentials: true,
  },
};