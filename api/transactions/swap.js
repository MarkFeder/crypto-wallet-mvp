const crypto = require('crypto');
const Joi = require('joi');
const db = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');
const { validateBody } = require('../_lib/validate');
const {
  safeParseFloat,
  hasSufficientBalance,
  calculateSwapWithFee,
  toFixedSafe,
} = require('../_lib/calculations');

const TRANSACTION_CONFIG = {
  FEE_PERCENTAGE: 0.005,
};

const SUPPORTED_TOKENS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

const swapSchema = Joi.object({
  walletAddress: Joi.string().required().messages({
    'any.required': 'Wallet address is required',
  }),
  fromToken: Joi.string()
    .valid(...SUPPORTED_TOKENS)
    .required()
    .messages({
      'any.only': `From token must be one of: ${SUPPORTED_TOKENS.join(', ')}`,
      'any.required': 'From token is required',
    }),
  toToken: Joi.string()
    .valid(...SUPPORTED_TOKENS)
    .required()
    .messages({
      'any.only': `To token must be one of: ${SUPPORTED_TOKENS.join(', ')}`,
      'any.required': 'To token is required',
    }),
  fromAmount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'From amount is required',
  }),
});

const queries = {
  findAssetBalance: `
    SELECT balance
    FROM assets
    WHERE wallet_address = $1 AND token_symbol = $2
  `,
  findPricesByTokens: `
    SELECT token_symbol, price_usd
    FROM price_cache
    WHERE token_symbol IN ($1, $2)
  `,
  updateAssetBalance: `
    UPDATE assets
    SET balance = $1, last_updated = CURRENT_TIMESTAMP
    WHERE wallet_address = $2 AND token_symbol = $3
  `,
  insertAsset: `
    INSERT INTO assets (wallet_address, token_symbol, token_name, balance)
    VALUES ($1, $2, $3, $4)
  `,
  createTransaction: `
    INSERT INTO transactions (wallet_address, tx_hash, from_address, to_address, amount, token_symbol, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
};

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    // Validate request body
    const validation = validateBody(swapSchema, req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { walletAddress, fromToken, toToken, fromAmount } = validation.value;

    // Check same token swap
    if (fromToken === toToken) {
      return res.status(400).json({ error: 'Cannot swap to the same token' });
    }

    // Check balance of fromToken
    const fromAsset = await db.query(queries.findAssetBalance, [walletAddress, fromToken]);

    if (fromAsset.rows.length === 0) {
      return res.status(400).json({ error: 'Asset not found in wallet' });
    }

    if (!hasSufficientBalance(fromAsset.rows[0].balance, fromAmount)) {
      return res.status(400).json({ error: 'Insufficient balance for swap' });
    }

    // Get token prices
    const prices = await db.query(queries.findPricesByTokens, [fromToken, toToken]);
    const priceMap = {};
    prices.rows.forEach(p => {
      priceMap[p.token_symbol] = safeParseFloat(p.price_usd, 1);
    });

    // Calculate swap with fee
    const { toAmount, feeUSD } = calculateSwapWithFee(
      fromAmount,
      priceMap[fromToken],
      priceMap[toToken],
      TRANSACTION_CONFIG.FEE_PERCENTAGE
    );
    const toAmountFormatted = toFixedSafe(toAmount, 8);

    // Execute the swap
    const currentFromBalance = safeParseFloat(fromAsset.rows[0].balance);
    const newFromBalance = currentFromBalance - safeParseFloat(fromAmount);
    await db.query(queries.updateAssetBalance, [newFromBalance.toString(), walletAddress, fromToken]);

    // Add to destination token
    const toAsset = await db.query(queries.findAssetBalance, [walletAddress, toToken]);
    if (toAsset.rows.length === 0) {
      await db.query(queries.insertAsset, [walletAddress, toToken, toToken, toAmountFormatted]);
    } else {
      const currentToBalance = safeParseFloat(toAsset.rows[0].balance);
      const newToBalance = currentToBalance + safeParseFloat(toAmountFormatted);
      await db.query(queries.updateAssetBalance, [newToBalance.toString(), walletAddress, toToken]);
    }

    // Create transaction record
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    await db.query(queries.createTransaction, [
      walletAddress,
      txHash,
      walletAddress,
      walletAddress,
      fromAmount,
      `${fromToken}->${toToken}`,
      'confirmed',
    ]);

    return res.status(200).json({
      success: true,
      data: {
        swap: {
          from: { token: fromToken, amount: fromAmount },
          to: { token: toToken, amount: toAmountFormatted },
          fee: toFixedSafe(feeUSD, 2),
          txHash,
        },
      },
    });
  } catch (error) {
    console.error('Swap tokens error:', error);
    return res.status(500).json({ error: 'Failed to swap tokens' });
  }
};
