const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, walletController.createWallet);
router.get('/', authenticateToken, walletController.getWallets);
router.get('/:id', authenticateToken, walletController.getWalletById);

module.exports = router;
