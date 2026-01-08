export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
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

export const SUPPORTED_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'crypto_wallet_token',
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
