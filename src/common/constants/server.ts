/**
 * Server-specific constants
 * Re-exports shared constants with server-specific overrides
 */

import { TRANSACTION_CONFIG as BASE_TRANSACTION_CONFIG } from './shared';

// Re-export all shared constants
export {
  SUPPORTED_CURRENCIES,
  PAGINATION,
  HTTP_STATUS,
  VALIDATION,
} from './shared';

export type { SupportedCurrency } from './shared';

// Server-specific transaction config with longer confirmation delay
export const TRANSACTION_CONFIG = {
  ...BASE_TRANSACTION_CONFIG,
  CONFIRMATION_DELAY: 5000, // 5 seconds for server-side processing
} as const;
