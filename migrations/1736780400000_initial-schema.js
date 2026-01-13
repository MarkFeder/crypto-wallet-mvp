/**
 * Initial database schema migration
 *
 * This is the baseline migration that creates the initial database structure.
 * If you're setting up a new database, run this migration first.
 * If you have an existing database, mark this migration as complete:
 *   npm run migrate:mark -- 1736780400000_initial-schema
 */

exports.up = (pgm) => {
  // Users table
  pgm.createTable('users', {
    id: 'id', // shorthand for SERIAL PRIMARY KEY
    username: { type: 'varchar(255)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Wallets table
  pgm.createTable('wallets', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    name: { type: 'varchar(255)', notNull: true },
    encrypted_mnemonic: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('wallets', 'user_id', { name: 'idx_wallet_user' });

  // Wallet addresses table
  pgm.createTable('wallet_addresses', {
    id: 'id',
    wallet_id: {
      type: 'integer',
      notNull: true,
      references: 'wallets',
      onDelete: 'CASCADE',
    },
    currency: { type: 'varchar(10)', notNull: true },
    address: { type: 'varchar(255)', notNull: true },
    balance: { type: 'decimal(20, 8)', default: 0 },
    last_updated: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('wallet_addresses', 'wallet_id', { name: 'idx_wallet_addresses_wallet' });

  // Transactions table
  pgm.createTable('transactions', {
    id: 'id',
    wallet_id: {
      type: 'integer',
      notNull: true,
      references: 'wallets',
      onDelete: 'CASCADE',
    },
    currency: { type: 'varchar(10)', notNull: true },
    type: { type: 'varchar(10)', notNull: true }, // 'send' or 'receive'
    amount: { type: 'decimal(20, 8)', notNull: true },
    to_address: { type: 'varchar(255)' },
    from_address: { type: 'varchar(255)' },
    tx_hash: { type: 'varchar(255)' },
    status: { type: 'varchar(20)', default: 'pending' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('transactions', 'wallet_id', { name: 'idx_transactions_wallet' });

  // Price cache table
  pgm.createTable('price_cache', {
    id: 'id',
    token_symbol: { type: 'varchar(10)', notNull: true, unique: true },
    price_usd: { type: 'decimal(20, 8)', notNull: true },
    change_24h: { type: 'decimal(10, 2)', default: 0 },
    last_updated: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('price_cache', 'token_symbol', { name: 'idx_price_cache_symbol' });
};

exports.down = (pgm) => {
  pgm.dropTable('price_cache', { cascade: true });
  pgm.dropTable('transactions', { cascade: true });
  pgm.dropTable('wallet_addresses', { cascade: true });
  pgm.dropTable('wallets', { cascade: true });
  pgm.dropTable('users', { cascade: true });
};
