const crypto = require('crypto');
const { ethers } = require('ethers');
const db = require('../config/db');
const queries = require('../queries');

// Send transaction (simulated for MVP)
exports.sendTransaction = async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, tokenSymbol } = req.body;
    
    // Validate inputs
    if (!ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    // Check if wallet exists and has sufficient balance
    const assetResult = await db.query(queries.transaction.findAssetBalance, [fromAddress, tokenSymbol]);

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found in wallet'
      });
    }

    const currentBalance = parseFloat(assetResult.rows[0].balance);
    if (currentBalance < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
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
      'pending',
    ]);

    // Update sender balance
    const newBalance = (currentBalance - parseFloat(amount)).toString();
    await db.query(queries.transaction.updateAssetBalance, [newBalance, fromAddress, tokenSymbol]);

    // Simulate transaction confirmation after 2 seconds
    setTimeout(async () => {
      await db.query(queries.transaction.updateTransactionStatus, ['confirmed', txHash]);
    }, 2000);
    
    res.status(200).json({
      success: true,
      transaction: {
        txHash,
        from: fromAddress,
        to: toAddress,
        amount,
        tokenSymbol,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send transaction'
    });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(queries.transaction.findTransactionsByAddress, [address, limit, offset]);
    
    res.json({
      success: true,
      transactions: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction history'
    });
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  try {
    const { txHash } = req.params;

    const result = await db.query(queries.transaction.findTransactionByHash, [txHash]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting transaction details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction details'
    });
  }
};

// Swap tokens (simulated for MVP)
exports.swapTokens = async (req, res) => {
  try {
    const { walletAddress, fromToken, toToken, fromAmount } = req.body;
    
    // Validate inputs
    if (!walletAddress || !fromToken || !toToken || !fromAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Check balance of fromToken
    const fromAsset = await db.query(queries.transaction.findAssetBalance, [walletAddress, fromToken]);
    
    if (fromAsset.rows.length === 0 || parseFloat(fromAsset.rows[0].balance) < parseFloat(fromAmount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance for swap'
      });
    }
    
    // Get prices
    const prices = await db.query(
      `SELECT token_symbol, price_usd FROM price_cache WHERE token_symbol IN ($1, $2)`,
      [fromToken, toToken]
    );
    
    const priceMap = {};
    prices.rows.forEach(p => {
      priceMap[p.token_symbol] = parseFloat(p.price_usd);
    });
    
    // Calculate swap with 0.5% fee
    const fromValueUSD = parseFloat(fromAmount) * (priceMap[fromToken] || 1);
    const fee = fromValueUSD * 0.005; // 0.5% fee
    const toValueUSD = fromValueUSD - fee;
    const toAmount = (toValueUSD / (priceMap[toToken] || 1)).toFixed(8);
    
    // Update balances
    const newFromBalance = (parseFloat(fromAsset.rows[0].balance) - parseFloat(fromAmount)).toString();

    await db.query(queries.transaction.updateAssetBalance, [newFromBalance, walletAddress, fromToken]);

    // Check if toToken asset exists, if not create it
    const toAsset = await db.query(queries.transaction.findAssetBalance, [walletAddress, toToken]);

    if (toAsset.rows.length === 0) {
      await db.query(queries.transaction.insertAsset, [walletAddress, toToken, toToken, toAmount]);
    } else {
      const newToBalance = (parseFloat(toAsset.rows[0].balance) + parseFloat(toAmount)).toString();
      await db.query(queries.transaction.updateAssetBalance, [newToBalance, walletAddress, toToken]);
    }

    // Create transaction records
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    await db.query(queries.transaction.createTransaction, [
      walletAddress,
      txHash,
      walletAddress,
      walletAddress,
      fromAmount,
      `${fromToken}->${toToken}`,
      'confirmed',
    ]);
    
    res.json({
      success: true,
      swap: {
        from: { token: fromToken, amount: fromAmount },
        to: { token: toToken, amount: toAmount },
        fee: fee.toFixed(2),
        txHash
      }
    });
  } catch (error) {
    console.error('Error swapping tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to swap tokens'
    });
  }
};

module.exports = exports;
