/**
 * Transaction-related database queries
 */

export const transactionQueries = {
  // Get asset balance
  findAssetBalance: `
    SELECT balance
    FROM assets
    WHERE wallet_address = $1 AND token_symbol = $2
  `,

  // Create transaction
  createTransaction: `
    INSERT INTO transactions (wallet_address, tx_hash, from_address, to_address, amount, token_symbol, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  // Update asset balance
  updateAssetBalance: `
    UPDATE assets
    SET balance = $1, last_updated = CURRENT_TIMESTAMP
    WHERE wallet_address = $2 AND token_symbol = $3
  `,

  // Update transaction status
  updateTransactionStatus: `
    UPDATE transactions
    SET status = $1
    WHERE tx_hash = $2
  `,

  // Get transaction history
  findTransactionsByAddress: `
    SELECT tx_hash, from_address, to_address, amount, token_symbol, status, timestamp
    FROM transactions
    WHERE wallet_address = $1
    ORDER BY timestamp DESC
    LIMIT $2 OFFSET $3
  `,

  // Get transaction by hash
  findTransactionByHash: `
    SELECT *
    FROM transactions
    WHERE tx_hash = $1
  `,

  // Get prices for tokens
  findPricesByTokens: `
    SELECT token_symbol, price_usd
    FROM price_cache
    WHERE token_symbol IN ($1, $2)
  `,

  // Insert asset
  insertAsset: `
    INSERT INTO assets (wallet_address, token_symbol, token_name, balance)
    VALUES ($1, $2, $3, $4)
  `,

  // Get transactions for wallet
  findTransactionsByWalletId: `
    SELECT *
    FROM transactions
    WHERE wallet_id = $1
    ORDER BY created_at DESC
  `,
} as const;

export default transactionQueries;
