const Joi = require('joi');
const db = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');
const { validateBody } = require('../_lib/validate');
const cryptoUtils = require('../_lib/crypto-utils');
const { rateLimitApi } = require('../_lib/rate-limit');

const createWalletSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Wallet name cannot be empty',
    'string.max': 'Wallet name must be at most 50 characters',
    'any.required': 'Wallet name is required',
  }),
});

const queries = {
  createWallet: `
    INSERT INTO wallets (user_id, name, encrypted_mnemonic)
    VALUES ($1, $2, $3)
    RETURNING id, name
  `,
  insertWalletAddress: `
    INSERT INTO wallet_addresses (wallet_id, currency, address)
    VALUES ($1, $2, $3)
  `,
  findWalletsByUserId: `
    SELECT id, name, created_at
    FROM wallets
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,
  findAddressesByWalletId: `
    SELECT currency, address, balance
    FROM wallet_addresses
    WHERE wallet_id = $1
    ORDER BY currency
  `,
};

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Apply rate limiting
  if (await rateLimitApi(req, res)) return;

  // Check authentication
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    return getWallets(req, res, user);
  } else if (req.method === 'POST') {
    return createWallet(req, res, user);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

async function getWallets(req, res, user) {
  try {
    const walletsResult = await db.query(queries.findWalletsByUserId, [user.id]);

    const wallets = await Promise.all(
      walletsResult.rows.map(async wallet => {
        const addressesResult = await db.query(queries.findAddressesByWalletId, [wallet.id]);
        return {
          ...wallet,
          addresses: addressesResult.rows,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { wallets },
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    return res.status(500).json({ error: 'Failed to fetch wallets' });
  }
}

async function createWallet(req, res, user) {
  try {
    // Validate request body
    const validation = validateBody(createWalletSchema, req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { name } = validation.value;

    // Generate mnemonic and create wallet
    const mnemonic = cryptoUtils.generateMnemonic();

    const walletResult = await db.query(queries.createWallet, [user.id, name, mnemonic]);
    const wallet = walletResult.rows[0];

    // Derive addresses
    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    // Store addresses
    await db.query(queries.insertWalletAddress, [wallet.id, 'BTC', btcAddress.address]);
    await db.query(queries.insertWalletAddress, [wallet.id, 'ETH', ethAddress.address]);

    return res.status(201).json({
      success: true,
      data: {
        wallet,
        mnemonic,
        addresses: {
          BTC: btcAddress.address,
          ETH: ethAddress.address,
        },
      },
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    return res.status(500).json({ error: 'Failed to create wallet' });
  }
}
