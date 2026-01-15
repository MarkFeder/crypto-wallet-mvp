/**
 * Base configuration - shared across all environments
 * These values can be overridden by environment-specific configs
 */

export interface BaseConfig {
  app: {
    name: string;
    port: number | string;
  };
  jwt: {
    expiresIn: string;
    secret?: string;
  };
  api: {
    rateLimit: {
      windowMs: number;
      max: number;
    };
  };
  cors: {
    credentials: boolean;
    origin?: string[] | string;
  };
}

const base: BaseConfig = {
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

export default base;
