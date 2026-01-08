const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

router.post('/send', authenticateToken, transactionController.sendTransaction);
router.post('/swap', authenticateToken, transactionController.swapTokens);
router.get('/history/:address', authenticateToken, transactionController.getTransactionHistory);
router.get('/:txHash', authenticateToken, transactionController.getTransactionDetails);

module.exports = router;
