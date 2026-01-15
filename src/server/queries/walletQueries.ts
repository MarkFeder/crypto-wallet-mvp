/**
 * Wallet-related database queries
 */

export const walletQueries = {
  // Create a new wallet
  createWallet: `
    INSERT INTO wallets (user_id, name, encrypted_mnemonic)
    VALUES ($1, $2, $3)
    RETURNING id, name
  `,

  // Insert wallet address
  insertWalletAddress: `
    INSERT INTO wallet_addresses (wallet_id, currency, address)
    VALUES ($1, $2, $3)
  `,

  // Get all wallets for a user
  findWalletsByUserId: `
    SELECT id, name, created_at
    FROM wallets
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,

  // Get wallet by ID and user ID
  findWalletByIdAndUserId: `
    SELECT *
    FROM wallets
    WHERE id = $1 AND user_id = $2
  `,

  // Get wallet addresses
  findAddressesByWalletId: `
    SELECT currency, address, balance
    FROM wallet_addresses
    WHERE wallet_id = $1
    ORDER BY currency
  `,

  // Update wallet name
  updateWalletName: `
    UPDATE wallets
    SET name = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, name, created_at
  `,

  // Update address balance
  updateAddressBalance: `
    UPDATE wallet_addresses
    SET balance = $1, last_updated = CURRENT_TIMESTAMP
    WHERE wallet_id = $2 AND currency = $3
  `,

  // Delete wallet
  deleteWallet: `
    DELETE FROM wallets
    WHERE id = $1 AND user_id = $2
  `,
} as const;

export default walletQueries;
