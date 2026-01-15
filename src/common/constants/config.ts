/**
 * Client-specific constants
 * Re-exports shared constants with client-specific additions
 */

// Type declaration for window to allow compilation in server context
declare const window: { location: { hostname: string } } | undefined;

import { TRANSACTION_CONFIG as BASE_TRANSACTION_CONFIG } from './shared';

// Re-export all shared constants for client use
export {
  SUPPORTED_CURRENCIES,
  PAGINATION,
  HTTP_STATUS,
  VALIDATION,
} from './shared';

export type { SupportedCurrency } from './shared';

// Client-specific transaction config with shorter confirmation delay for UI
export const TRANSACTION_CONFIG = {
  ...BASE_TRANSACTION_CONFIG,
  CONFIRMATION_DELAY: 2000, // 2 seconds for UI feedback
} as const;

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
