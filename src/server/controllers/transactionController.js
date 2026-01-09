const crypto = require('crypto');
const { ethers } = require('ethers');
const db = require('../config/db');
const queries = require('../queries');
const { TRANSACTION_CONFIG, PAGINATION } = require('../../constants/serverConfig');
const { sendSuccess, badRequest, notFound, serverError } = require('../utils/apiResponse');
const { safeParseFloat, calculateSwapWithFee, hasSufficientBalance, toFixedSafe } = require('../utils/calculations');
const swapService = require('../services/swapService');

// Send transaction (simulated for MVP)
exports.sendTransaction = async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, tokenSymbol } = req.body;
    
    // Validate inputs
    if (!ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      return badRequest(res, 'Invalid address format');
    }

    if (safeParseFloat(amount) <= 0) {
      return badRequest(res, 'Invalid amount');
    }

    // Check if wallet exists and has sufficient balance
    const assetResult = await db.query(queries.transaction.findAssetBalance, [fromAddress, tokenSymbol]);

    if (assetResult.rows.length === 0) {
      return notFound(res, 'Asset not found in wallet');
    }

    const currentBalance = safeParseFloat(assetResult.rows[0].balance);
    if (!hasSufficientBalance(currentBalance, amount)) {
      return badRequest(res, 'Insufficient balance');
    }

    // Generate simulated transaction hash
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');

    // Create transaction record
    await db.query(queries.transaction.createTransaction, [
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
    await db.query(queries.transaction.updateAssetBalance, [newBalance, fromAddress, tokenSymbol]);

    // Simulate transaction confirmation
    setTimeout(async () => {
      await db.query(queries.transaction.updateTransactionStatus, ['confirmed', txHash]);
    }, TRANSACTION_CONFIG.CONFIRMATION_DELAY);
    
    return sendSuccess(res, {
      transaction: {
        txHash,
        from: fromAddress,
        to: toAddress,
        amount,
        tokenSymbol,
        status: TRANSACTION_CONFIG.DEFAULT_STATUS
      }
    });
  } catch (error) {
    return serverError(res, 'Failed to send transaction', error);
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const offset = parseInt(req.query.offset) || PAGINATION.DEFAULT_OFFSET;

    const result = await db.query(queries.transaction.findTransactionsByAddress, [address, limit, offset]);

    return sendSuccess(res, {
      transactions: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    return serverError(res, 'Failed to get transaction history', error);
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  try {
    const { txHash } = req.params;

    const result = await db.query(queries.transaction.findTransactionByHash, [txHash]);

    if (result.rows.length === 0) {
      return notFound(res, 'Transaction not found');
    }

    return sendSuccess(res, {
      transaction: result.rows[0]
    });
  } catch (error) {
    return serverError(res, 'Failed to get transaction details', error);
  }
};

// Swap tokens (simulated for MVP)
exports.swapTokens = async (req, res) => {
  try {
    const { walletAddress, fromToken, toToken, fromAmount } = req.body;
    
    // Validate inputs
    if (!walletAddress || !fromToken || !toToken || !fromAmount) {
      return badRequest(res, 'Missing required fields');
    }

    // Check balance of fromToken
    const fromAsset = await db.query(queries.transaction.findAssetBalance, [walletAddress, fromToken]);

    if (fromAsset.rows.length === 0) {
      return badRequest(res, 'Asset not found in wallet');
    }

    if (!hasSufficientBalance(fromAsset.rows[0].balance, fromAmount)) {
      return badRequest(res, 'Insufficient balance for swap');
    }
    
    // Get token prices
    const priceMap = await swapService.fetchTokenPrices(fromToken, toToken);

    // Calculate swap with fee
    const { toAmount, feeUSD } = calculateSwapWithFee(
      fromAmount,
      priceMap[fromToken],
      priceMap[toToken],
      TRANSACTION_CONFIG.FEE_PERCENTAGE
    );
    const toAmountFormatted = toFixedSafe(toAmount, 8);

    // Execute the swap (update balances)
    const currentFromBalance = safeParseFloat(fromAsset.rows[0].balance);
    await swapService.executeSwap(
      walletAddress,
      fromToken,
      toToken,
      fromAmount,
      toAmountFormatted,
      currentFromBalance
    );

    // Create transaction record
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    await swapService.createSwapTransaction(walletAddress, fromToken, toToken, fromAmount, txHash);
    
    return sendSuccess(res, {
      swap: {
        from: { token: fromToken, amount: fromAmount },
        to: { token: toToken, amount: toAmountFormatted },
        fee: toFixedSafe(feeUSD, 2),
        txHash
      }
    });
  } catch (error) {
    return serverError(res, 'Failed to swap tokens', error);
  }
};

module.exports = exports;
