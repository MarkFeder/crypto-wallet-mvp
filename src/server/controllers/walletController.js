const db = require('../config/db');
const cryptoUtils = require('../utils/crypto-utils');
const queries = require('../queries');

const createWallet = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const mnemonic = cryptoUtils.generateMnemonic();

    const walletResult = await db.query(queries.wallet.createWallet, [userId, name, mnemonic]);
    const wallet = walletResult.rows[0];

    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    await db.query(queries.wallet.insertWalletAddress, [wallet.id, 'BTC', btcAddress.address]);
    await db.query(queries.wallet.insertWalletAddress, [wallet.id, 'ETH', ethAddress.address]);

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

    const walletsResult = await db.query(queries.wallet.findWalletsByUserId, [userId]);

    const wallets = await Promise.all(
      walletsResult.rows.map(async (wallet) => {
        const addressesResult = await db.query(queries.wallet.findAddressesByWalletId, [wallet.id]);

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

    const walletResult = await db.query(queries.wallet.findWalletByIdAndUserId, [walletId, userId]);

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];

    const addressesResult = await db.query(queries.wallet.findAddressesByWalletId, [walletId]);

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
