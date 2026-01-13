const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const walletRoutes = require('./wallet');
const transactionRoutes = require('./transaction');
const priceRoutes = require('./price');

router.use('/auth', authRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/prices', priceRoutes);

module.exports = router;
