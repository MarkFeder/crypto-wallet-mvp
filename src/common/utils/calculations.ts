/**
 * Shared calculation utilities for crypto wallet operations
 * Used by both client and server
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
