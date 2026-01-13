/**
 * Mock database for testing
 * Simulates PostgreSQL query responses
 */

// In-memory storage
const storage = {
  users: [],
  wallets: [],
  wallet_addresses: [],
  transactions: [],
};

// Reset storage between tests
const resetStorage = () => {
  storage.users = [];
  storage.wallets = [];
  storage.wallet_addresses = [];
  storage.transactions = [];
};

// Seed initial test data
const seedTestData = (testUser = null) => {
  const user = testUser || {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: '$2a$10$abcdefghijklmnopqrstuv',
  };
  if (!storage.users.find(u => u.id === user.id)) {
    storage.users.push(user);
  }
  return user;
};

// Auto-incrementing IDs
let walletIdCounter = 0;
let addressIdCounter = 0;
let transactionIdCounter = 0;

// Mock query function
const query = jest.fn(async (queryText, params = []) => {
  // Normalize query text for matching
  const normalizedQuery = queryText.toLowerCase().replace(/\s+/g, ' ').trim();

  // CREATE USER
  if (normalizedQuery.includes('insert into users')) {
    const [username, email, password_hash] = params;
    const newUser = {
      id: storage.users.length + 1,
      username,
      email,
      password_hash,
      created_at: new Date().toISOString(),
    };
    storage.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // FIND USER BY EMAIL
  if (normalizedQuery.includes('select') && normalizedQuery.includes('users') && normalizedQuery.includes('email')) {
    const [email] = params;
    const user = storage.users.find((u) => u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // CREATE WALLET
  if (normalizedQuery.includes('insert into wallets')) {
    const [user_id, name, mnemonic_encrypted] = params;
    walletIdCounter++;
    const newWallet = {
      id: walletIdCounter,
      user_id,
      name,
      mnemonic_encrypted,
      created_at: new Date().toISOString(),
    };
    storage.wallets.push(newWallet);
    return { rows: [newWallet], rowCount: 1 };
  }

  // CREATE WALLET ADDRESS
  if (normalizedQuery.includes('insert into wallet_addresses')) {
    const [wallet_id, currency, address] = params;
    addressIdCounter++;
    const newAddress = {
      id: addressIdCounter,
      wallet_id,
      currency,
      address,
      balance: '0',
      created_at: new Date().toISOString(),
    };
    storage.wallet_addresses.push(newAddress);
    return { rows: [newAddress], rowCount: 1 };
  }

  // GET WALLETS BY USER ID
  if (normalizedQuery.includes('select') && normalizedQuery.includes('wallets') &&
      normalizedQuery.includes('user_id') && !normalizedQuery.includes('and')) {
    const [user_id] = params;
    const wallets = storage.wallets.filter((w) => w.user_id === user_id);
    return { rows: wallets, rowCount: wallets.length };
  }

  // GET WALLET BY ID AND USER ID
  if (normalizedQuery.includes('select') && normalizedQuery.includes('wallets') &&
      params.length === 2 && normalizedQuery.includes('and')) {
    const [wallet_id, user_id] = params;
    const wallet = storage.wallets.find((w) => w.id === parseInt(wallet_id) && w.user_id === user_id);
    return { rows: wallet ? [wallet] : [], rowCount: wallet ? 1 : 0 };
  }

  // GET ADDRESSES BY WALLET ID
  if (normalizedQuery.includes('select') && normalizedQuery.includes('wallet_addresses') &&
      normalizedQuery.includes('wallet_id')) {
    const [wallet_id] = params;
    const addresses = storage.wallet_addresses.filter((a) => a.wallet_id === parseInt(wallet_id));
    return { rows: addresses, rowCount: addresses.length };
  }

  // DELETE WALLET
  if (normalizedQuery.includes('delete from wallets')) {
    const [wallet_id, user_id] = params;
    const index = storage.wallets.findIndex((w) => w.id === parseInt(wallet_id) && w.user_id === user_id);
    if (index > -1) {
      storage.wallets.splice(index, 1);
      storage.wallet_addresses = storage.wallet_addresses.filter((a) => a.wallet_id !== parseInt(wallet_id));
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // CREATE TRANSACTION
  if (normalizedQuery.includes('insert into transactions')) {
    const [wallet_address, tx_hash, from_address, to_address, amount, token_symbol, status] = params;
    transactionIdCounter++;
    const newTx = {
      id: transactionIdCounter,
      wallet_address,
      tx_hash,
      from_address,
      to_address,
      amount,
      token_symbol,
      status,
      created_at: new Date().toISOString(),
    };
    storage.transactions.push(newTx);
    return { rows: [newTx], rowCount: 1 };
  }

  // GET TRANSACTION BY HASH
  if (normalizedQuery.includes('select') && normalizedQuery.includes('transactions') &&
      normalizedQuery.includes('tx_hash')) {
    const [tx_hash] = params;
    const tx = storage.transactions.find((t) => t.tx_hash === tx_hash);
    return { rows: tx ? [tx] : [], rowCount: tx ? 1 : 0 };
  }

  // GET TRANSACTIONS BY ADDRESS
  if (normalizedQuery.includes('select') && normalizedQuery.includes('transactions') &&
      (normalizedQuery.includes('from_address') || normalizedQuery.includes('to_address'))) {
    const [address, limit = 50, offset = 0] = params;
    const transactions = storage.transactions.filter(
      (t) => t.from_address === address || t.to_address === address
    );
    return { rows: transactions.slice(offset, offset + limit), rowCount: transactions.length };
  }

  // UPDATE TRANSACTION STATUS
  if (normalizedQuery.includes('update') && normalizedQuery.includes('transactions') &&
      normalizedQuery.includes('status')) {
    const [status, tx_hash] = params;
    const tx = storage.transactions.find((t) => t.tx_hash === tx_hash);
    if (tx) {
      tx.status = status;
    }
    return { rows: [], rowCount: tx ? 1 : 0 };
  }

  // GET ASSET BALANCE (for transactions) - handles both 'assets' and 'wallet_addresses' tables
  if (normalizedQuery.includes('select') && normalizedQuery.includes('balance') &&
      (normalizedQuery.includes('assets') || normalizedQuery.includes('wallet_addresses')) &&
      params.length === 2) {
    const [address, token_symbol] = params;
    const asset = storage.wallet_addresses.find((a) => a.address === address && a.currency === token_symbol);
    return { rows: asset ? [{ balance: asset.balance }] : [], rowCount: asset ? 1 : 0 };
  }

  // UPDATE ASSET BALANCE - handles both 'assets' and 'wallet_addresses' tables
  if (normalizedQuery.includes('update') &&
      (normalizedQuery.includes('assets') || normalizedQuery.includes('wallet_addresses')) &&
      normalizedQuery.includes('balance')) {
    const [balance, address, currency] = params;
    const asset = storage.wallet_addresses.find((a) => a.address === address && a.currency === currency);
    if (asset) {
      asset.balance = balance;
    }
    return { rows: [], rowCount: asset ? 1 : 0 };
  }

  // Default empty response
  console.log('Unhandled query:', normalizedQuery, params);
  return { rows: [], rowCount: 0 };
});

// Reset counters
const resetCounters = () => {
  walletIdCounter = 0;
  addressIdCounter = 0;
  transactionIdCounter = 0;
};

module.exports = {
  query,
  storage,
  resetStorage: () => {
    resetStorage();
    resetCounters();
  },
  seedTestData,
};
