/**
 * Server-side calculation utilities for crypto wallet operations
 */

/**
 * Safely parse a string or number to float
 * Returns fallback value if parsing fails
 */
const safeParseFloat = (value, fallback = 0) => {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Calculate the USD value of a crypto asset
 */
const calculateAssetValue = (balance, price) => {
  const balanceNum = safeParseFloat(balance);
  const priceNum = safeParseFloat(price);
  return balanceNum * priceNum;
};

/**
 * Calculate swap amount with fee
 * @returns Object containing toAmount and feeUSD
 */
const calculateSwapWithFee = (fromAmount, fromPrice, toPrice, feePercentage) => {
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
 * Check if balance is sufficient for transaction
 */
const hasSufficientBalance = (balance, amount, fee = 0) => {
  const balanceNum = safeParseFloat(balance);
  const amountNum = safeParseFloat(amount);
  const feeNum = safeParseFloat(fee);

  return balanceNum >= (amountNum + feeNum);
};

/**
 * Format a number to a fixed decimal places
 */
const toFixedSafe = (num, decimals = 8) => {
  if (isNaN(num)) {
    return '0';
  }
  return num.toFixed(decimals);
};

module.exports = {
  safeParseFloat,
  calculateAssetValue,
  calculateSwapWithFee,
  hasSufficientBalance,
  toFixedSafe,
};
