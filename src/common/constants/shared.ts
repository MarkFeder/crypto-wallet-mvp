/**
 * Shared constants used by both client and server
 * Environment-specific values (like CONFIRMATION_DELAY) are defined in config.ts and server.ts
 */

export const SUPPORTED_CURRENCIES = [
  'BTC',
  'ETH',
  'USDT',
  'USDC',
  'BNB',
  'SOL',
  'XRP',
  'ADA',
  'DOGE',
  'DOT',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const TRANSACTION_CONFIG = {
  FEE_PERCENTAGE: 0.005, // 0.5% fee
  DEFAULT_STATUS: 'pending' as const,
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ETH_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  BTC_ADDRESS_REGEX: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
} as const;
