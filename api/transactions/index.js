const crypto = require('crypto');
const { ethers } = require('ethers');
const Joi = require('joi');
const db = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');
const { validateBody } = require('../_lib/validate');
const { safeParseFloat, hasSufficientBalance } = require('../_lib/calculations');

const TRANSACTION_CONFIG = {
  FEE_PERCENTAGE: 0.005,
  DEFAULT_STATUS: 'pending',
};

const sendTransactionSchema = Joi.object({
  fromAddress: Joi.string().required().messages({
    'any.required': 'From address is required',
  }),
  toAddress: Joi.string().required().messages({
    'any.required': 'To address is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  tokenSymbol: Joi.string().required().messages({
    'any.required': 'Token symbol is required',
  }),
});

const queries = {
  findAssetBalance: `
    SELECT balance
    FROM assets
    WHERE wallet_address = $1 AND token_symbol = $2
  `,
  createTransaction: `
    INSERT INTO transactions (wallet_address, tx_hash, from_address, to_address, amount, token_symbol, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
  updateAssetBalance: `
    UPDATE assets
    SET balance = $1, last_updated = CURRENT_TIMESTAMP
    WHERE wallet_address = $2 AND token_symbol = $3
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
    const validation = validateBody(sendTransactionSchema, req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { fromAddress, toAddress, amount, tokenSymbol } = validation.value;

    // Validate addresses
    if (!ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    // Check if wallet exists and has sufficient balance
    const assetResult = await db.query(queries.findAssetBalance, [fromAddress, tokenSymbol]);

    if (assetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found in wallet' });
    }

    const currentBalance = safeParseFloat(assetResult.rows[0].balance);
    if (!hasSufficientBalance(currentBalance, amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Generate simulated transaction hash
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');

    // Create transaction record
    await db.query(queries.createTransaction, [
      fromAddress,
      txHash,
      fromAddress,
      toAddress,
      amount,
      tokenSymbol,
      TRANSACTION_CONFIG.DEFAULT_STATUS,
    ]);

    // Update sender balance
    const newBalance = (currentBalance - safeParseFloat(amount)).toString();
    await db.query(queries.updateAssetBalance, [newBalance, fromAddress, tokenSymbol]);

    return res.status(200).json({
      success: true,
      data: {
        transaction: {
          txHash,
          from: fromAddress,
          to: toAddress,
          amount,
          tokenSymbol,
          status: TRANSACTION_CONFIG.DEFAULT_STATUS,
        },
      },
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    return res.status(500).json({ error: 'Failed to send transaction' });
  }
};
