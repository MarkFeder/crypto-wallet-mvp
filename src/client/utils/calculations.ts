/**
 * Calculation utilities for crypto wallet operations
 */

/**
 * Safely parse a string or number to float
 * Returns fallback value if parsing fails
 */
export const safeParseFloat = (value: string | number, fallback: number = 0): number => {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Calculate the USD value of a crypto asset
 * @param balance - The balance amount (can be string or number)
 * @param price - The price per unit in USD (can be string or number)
 * @returns The total value in USD
 */
export const calculateAssetValue = (balance: string | number, price: string | number): number => {
  const balanceNum = safeParseFloat(balance);
  const priceNum = safeParseFloat(price);
  return balanceNum * priceNum;
};

/**
 * Calculate swap amount with fee
 * @param fromAmount - Amount to swap from
 * @param fromPrice - Price of the token to swap from
 * @param toPrice - Price of the token to swap to
 * @param feePercentage - Fee percentage (e.g., 0.005 for 0.5%)
 * @returns Object containing toAmount and fee in USD
 */
export const calculateSwapWithFee = (
  fromAmount: string | number,
  fromPrice: number,
  toPrice: number,
  feePercentage: number
): { toAmount: number; feeUSD: number } => {
  const amount = safeParseFloat(fromAmount);
  const fromValueUSD = amount * fromPrice;
  const feeUSD = fromValueUSD * feePercentage;
  const toValueUSD = fromValueUSD - feeUSD;
  const toAmount = toValueUSD / toPrice;

  return {
    toAmount,
    feeUSD,
  };
};

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
 * Format a number to a fixed decimal places
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export const toFixedSafe = (num: number, decimals: number = 8): string => {
  if (isNaN(num)) {
    return '0';
  }
  return num.toFixed(decimals);
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

/**
 * Check if balance is sufficient for transaction
 * @param balance - Current balance
 * @param amount - Amount to spend
 * @param fee - Optional fee to include
 * @returns True if sufficient, false otherwise
 */
export const hasSufficientBalance = (
  balance: string | number,
  amount: string | number,
  fee: string | number = 0
): boolean => {
  const balanceNum = safeParseFloat(balance);
  const amountNum = safeParseFloat(amount);
  const feeNum = safeParseFloat(fee);

  return balanceNum >= amountNum + feeNum;
};
