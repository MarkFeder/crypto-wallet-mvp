const db = require('../config/db');
const queries = require('../queries');
const { safeParseFloat } = require('../utils/calculations');

/**
 * Fetch prices for given tokens
 * @returns Object with token symbols as keys and prices as values
 */
async function fetchTokenPrices(fromToken, toToken) {
  const prices = await db.query(
    `SELECT token_symbol, price_usd FROM price_cache WHERE token_symbol IN ($1, $2)`,
    [fromToken, toToken]
  );

  const priceMap = {};
  prices.rows.forEach(p => {
    priceMap[p.token_symbol] = safeParseFloat(p.price_usd, 1);
  });

  return priceMap;
}

/**
 * Update balance for a token in a wallet
 */
async function updateTokenBalance(walletAddress, token, newBalance) {
  await db.query(queries.transaction.updateAssetBalance, [
    newBalance.toString(),
    walletAddress,
    token,
  ]);
}

/**
 * Create or update the destination token balance
 */
async function createOrUpdateDestinationBalance(walletAddress, toToken, amountToAdd) {
  const toAsset = await db.query(queries.transaction.findAssetBalance, [walletAddress, toToken]);

  if (toAsset.rows.length === 0) {
    // Create new asset
    await db.query(queries.transaction.insertAsset, [
      walletAddress,
      toToken,
      toToken,
      amountToAdd.toString(),
    ]);
  } else {
    // Update existing asset
    const currentBalance = safeParseFloat(toAsset.rows[0].balance);
    const newBalance = currentBalance + safeParseFloat(amountToAdd);
    await updateTokenBalance(walletAddress, toToken, newBalance);
  }
}

/**
 * Create a swap transaction record
 */
async function createSwapTransaction(walletAddress, fromToken, toToken, fromAmount, txHash) {
  await db.query(queries.transaction.createTransaction, [
    walletAddress,
    txHash,
    walletAddress,
    walletAddress,
    fromAmount,
    `${fromToken}->${toToken}`,
    'confirmed',
  ]);
}

/**
 * Execute the swap by updating balances
 */
async function executeSwap(
  walletAddress,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  currentFromBalance
) {
  // Deduct from source token
  const newFromBalance = currentFromBalance - safeParseFloat(fromAmount);
  await updateTokenBalance(walletAddress, fromToken, newFromBalance);

  // Add to destination token
  await createOrUpdateDestinationBalance(walletAddress, toToken, toAmount);
}

module.exports = {
  fetchTokenPrices,
  updateTokenBalance,
  createOrUpdateDestinationBalance,
  createSwapTransaction,
  executeSwap,
};
