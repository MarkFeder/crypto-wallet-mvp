import db from '../config/db';
import queries from '../queries';
import { safeParseFloat } from '../../common/utils/calculations';

interface PriceRow {
  token_symbol: string;
  price_usd: string;
}

interface PriceMap {
  [symbol: string]: number;
}

/**
 * Fetch prices for given tokens
 * @returns Object with token symbols as keys and prices as values
 */
export async function fetchTokenPrices(fromToken: string, toToken: string): Promise<PriceMap> {
  const prices = await db.query<PriceRow>(
    `SELECT token_symbol, price_usd FROM price_cache WHERE token_symbol IN ($1, $2)`,
    [fromToken, toToken]
  );

  const priceMap: PriceMap = {};
  prices.rows.forEach(p => {
    priceMap[p.token_symbol] = safeParseFloat(p.price_usd, 1);
  });

  return priceMap;
}

/**
 * Update balance for a token in a wallet
 */
export async function updateTokenBalance(
  walletAddress: string,
  token: string,
  newBalance: number
): Promise<void> {
  await db.query(queries.transaction.updateAssetBalance, [
    newBalance.toString(),
    walletAddress,
    token,
  ]);
}

/**
 * Create or update the destination token balance
 */
export async function createOrUpdateDestinationBalance(
  walletAddress: string,
  toToken: string,
  amountToAdd: string | number
): Promise<void> {
  const toAsset = await db.query<{ balance: string }>(queries.transaction.findAssetBalance, [
    walletAddress,
    toToken,
  ]);

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
export async function createSwapTransaction(
  walletAddress: string,
  fromToken: string,
  toToken: string,
  fromAmount: string | number,
  txHash: string
): Promise<void> {
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
export async function executeSwap(
  walletAddress: string,
  fromToken: string,
  toToken: string,
  fromAmount: string | number,
  toAmount: string | number,
  currentFromBalance: number
): Promise<void> {
  // Deduct from source token
  const newFromBalance = currentFromBalance - safeParseFloat(fromAmount);
  await updateTokenBalance(walletAddress, fromToken, newFromBalance);

  // Add to destination token
  await createOrUpdateDestinationBalance(walletAddress, toToken, toAmount);
}
