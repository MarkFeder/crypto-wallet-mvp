const db = require('../config/db');
const cryptoUtils = require('../utils/crypto-utils');

const createWallet = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const mnemonic = cryptoUtils.generateMnemonic();

    const walletResult = await db.query(
      'INSERT INTO wallets (user_id, name, encrypted_mnemonic) VALUES ($1, $2, $3) RETURNING id, name',
      [userId, name, mnemonic]
    );

    const wallet = walletResult.rows[0];

    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

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
};

const getWallets = async (req, res) => {
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
};

const getWalletById = async (req, res) => {
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
};

module.exports = { createWallet, getWallets, getWalletById };
