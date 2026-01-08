const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const cryptoUtils = require('./crypto-utils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create new wallet
app.post('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Generate mnemonic
    const mnemonic = cryptoUtils.generateMnemonic();

    // In production, encrypt the mnemonic before storing
    // For MVP, we'll store it as-is (NOT RECOMMENDED FOR PRODUCTION)
    const walletResult = await db.query(
      'INSERT INTO wallets (user_id, name, encrypted_mnemonic) VALUES ($1, $2, $3) RETURNING id, name',
      [userId, name, mnemonic]
    );

    const wallet = walletResult.rows[0];

    // Derive addresses for Bitcoin and Ethereum
    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    // Store addresses
    await db.query(
      'INSERT INTO wallet_addresses (wallet_id, currency, address) VALUES ($1, $2, $3)',
      [wallet.id, 'BTC', btcAddress.address]
    );

    await db.query(
      'INSERT INTO wallet_addresses (wallet_id, currency, address) VALUES ($1, $2, $3)',
      [wallet.id, 'ETH', ethAddress.address]
    );

    res.status(201).json({
      wallet,
      mnemonic,
      addresses: {
        BTC: btcAddress.address,
        ETH: ethAddress.address,
      },
    });
  } catch (error) {
    console.error('Wallet creation error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Get user's wallets
app.get('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const walletsResult = await db.query(
      'SELECT id, name, created_at FROM wallets WHERE user_id = $1',
      [userId]
    );

    const wallets = await Promise.all(
      walletsResult.rows.map(async (wallet) => {
        const addressesResult = await db.query(
          'SELECT currency, address, balance FROM wallet_addresses WHERE wallet_id = $1',
          [wallet.id]
        );

        return {
          ...wallet,
          addresses: addressesResult.rows,
        };
      })
    );

    res.json({ wallets });
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Get wallet by ID
app.get('/api/wallets/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const walletId = req.params.id;

    const walletResult = await db.query(
      'SELECT * FROM wallets WHERE id = $1 AND user_id = $2',
      [walletId, userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];

    const addressesResult = await db.query(
      'SELECT currency, address, balance FROM wallet_addresses WHERE wallet_id = $1',
      [walletId]
    );

    res.json({
      wallet: {
        id: wallet.id,
        name: wallet.name,
        created_at: wallet.created_at,
        addresses: addressesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Mock price data endpoint (simulating exchange rates)
app.get('/api/prices', async (req, res) => {
  try {
    // In production, fetch from real API like CoinGecko or CoinMarketCap
    const mockPrices = {
      BTC: { usd: 42000, change_24h: 2.5 },
      ETH: { usd: 2200, change_24h: -1.2 },
    };

    res.json(mockPrices);
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Create transaction (mock - not actually sending on-chain)
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { walletId, currency, type, amount, toAddress } = req.body;
    const userId = req.user.id;

    // Verify wallet belongs to user
    const walletCheck = await db.query(
      'SELECT id FROM wallets WHERE id = $1 AND user_id = $2',
      [walletId, userId]
    );

    if (walletCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Get from address
    const addressResult = await db.query(
      'SELECT address FROM wallet_addresses WHERE wallet_id = $1 AND currency = $2',
      [walletId, currency]
    );

    const fromAddress = addressResult.rows[0]?.address;

    // Create transaction record
    const txResult = await db.query(
      'INSERT INTO transactions (wallet_id, currency, type, amount, to_address, from_address, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [walletId, currency, type, amount, toAddress, fromAddress, 'completed']
    );

    res.status(201).json({ transaction: txResult.rows[0] });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transactions for a wallet
app.get('/api/wallets/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const walletId = req.params.id;

    // Verify wallet belongs to user
    const walletCheck = await db.query(
      'SELECT id FROM wallets WHERE id = $1 AND user_id = $2',
      [walletId, userId]
    );

    if (walletCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const txResult = await db.query(
      'SELECT * FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC',
      [walletId]
    );

    res.json({ transactions: txResult.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
