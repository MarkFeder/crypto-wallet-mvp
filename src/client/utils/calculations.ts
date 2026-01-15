/**
 * Client-side calculation utilities for crypto wallet operations
 * Re-exports shared utilities and adds client-specific functions
 */

// Re-export shared utilities from common
export {
  safeParseFloat,
  calculateAssetValue,
  calculateSwapWithFee,
  toFixedSafe,
  hasSufficientBalance,
} from '../../common/utils/calculations';

// Import for local use
import { safeParseFloat } from '../../common/utils/calculations';

/**
 * Calculate total portfolio value from wallets and prices
 * @param wallets - Array of wallets with addresses
 * @param prices - Price data for currencies
 * @returns Total portfolio value in USD
 */
export const calculatePortfolioValue = (
  wallets: Array<{ addresses: Array<{ balance: string; currency: string }> }>,
  prices: Record<string, { price: string | number }>
): number => {
  let total = 0;

  for (const wallet of wallets) {
    for (const address of wallet.addresses || []) {
      const price = safeParseFloat(prices[address.currency]?.price || 0);
      const balance = safeParseFloat(address.balance);
      total += balance * price;
    }
  }

  return total;
};

/**
 * Calculate total balance for a specific currency across all wallets
 * @param wallets - Array of wallets with addresses
 * @param currency - The currency to calculate total balance for
 * @returns Total balance for the currency
 */
export const calculateCurrencyBalance = (
  wallets: Array<{ addresses: Array<{ balance: string; currency: string }> }>,
  currency: string
): number => {
  return wallets.reduce((sum, wallet) => {
    const addr = (wallet.addresses || []).find(a => a.currency === currency);
    return sum + (addr ? safeParseFloat(addr.balance) : 0);
  }, 0);
};

/**
 * Calculate percentage change
 * @param oldValue - Old value
 * @param newValue - New value
 * @returns Percentage change (e.g., 5.5 for 5.5% increase)
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return 0;
  }
  return ((newValue - oldValue) / oldValue) * 100;
};
