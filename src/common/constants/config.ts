// In production on Vercel, API is on same domain (/api)
// In development, use localhost:5000
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:5000/api');

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  WALLETS: {
    BASE: '/wallets',
    BY_ID: (id: number) => `/wallets/${id}`,
    TRANSACTIONS: (id: number) => `/wallets/${id}/transactions`,
  },
  TRANSACTIONS: {
    SEND: '/transactions/send',
    SWAP: '/transactions/swap',
    HISTORY: (address: string) => `/transactions/history/${address}`,
    DETAILS: (txHash: string) => `/transactions/${txHash}`,
  },
  PRICES: {
    BASE: '/prices',
    TOKEN: (symbol: string) => `/prices/${symbol}`,
    HISTORY: (symbol: string) => `/prices/${symbol}/history`,
  },
};

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
];

export const STORAGE_KEYS = {
  USER: 'crypto_wallet_user',
};

export const APP_CONFIG = {
  PRICE_POLLING_INTERVAL: 30000, // 30 seconds
  CLIPBOARD_RESET_DELAY: 2000, // 2 seconds
  ADDRESS_DISPLAY: {
    SHORT_START_LENGTH: 12,
    SHORT_END_LENGTH: 8,
    TRANSACTION_START_LENGTH: 12,
    TRANSACTION_END_LENGTH: 4,
  },
  FORMATTING: {
    CRYPTO_DECIMALS: 8,
    CURRENCY_DECIMALS: 2,
  },
};

export const TRANSACTION_CONFIG = {
  FEE_PERCENTAGE: 0.005, // 0.5% fee
  CONFIRMATION_DELAY: 2000, // 2 seconds for simulated confirmation
  DEFAULT_STATUS: 'pending' as const,
};

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ETH_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  BTC_ADDRESS_REGEX: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
