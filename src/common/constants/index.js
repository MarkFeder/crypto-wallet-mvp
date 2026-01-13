/**
 * Shared constants for both client and server
 * This is the JavaScript version for server-side usage
 */

const TRANSACTION_CONFIG = {
  FEE_PERCENTAGE: 0.005, // 0.5% fee
  CONFIRMATION_DELAY: 5000, // 5 seconds for simulated confirmation
  DEFAULT_STATUS: 'pending',
};

const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ETH_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  BTC_ADDRESS_REGEX: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
};

const SUPPORTED_CURRENCIES = [
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
];

module.exports = {
  TRANSACTION_CONFIG,
  PAGINATION,
  HTTP_STATUS,
  VALIDATION,
  SUPPORTED_CURRENCIES,
};
