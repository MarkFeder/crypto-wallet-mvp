-- Database schema for crypto wallet MVP

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  encrypted_mnemonic TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_addresses (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  address VARCHAR(255) NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'send' or 'receive'
  amount DECIMAL(20, 8) NOT NULL,
  to_address VARCHAR(255),
  from_address VARCHAR(255),
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_cache (
  id SERIAL PRIMARY KEY,
  token_symbol VARCHAR(10) UNIQUE NOT NULL,
  price_usd DECIMAL(20, 8) NOT NULL,
  change_24h DECIMAL(10, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_user ON wallets(user_id);
CREATE INDEX idx_wallet_addresses_wallet ON wallet_addresses(wallet_id);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_price_cache_symbol ON price_cache(token_symbol);
