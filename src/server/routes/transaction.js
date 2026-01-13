const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams, validateQuery } = require('../middleware/validate');
const {
  sendTransactionSchema,
  swapTokensSchema,
  addressParamSchema,
  txHashParamSchema,
  paginationQuerySchema
} = require('../schemas/transactionSchemas');

router.post('/send', authenticateToken, validate(sendTransactionSchema), transactionController.sendTransaction);
router.post('/swap', authenticateToken, validate(swapTokensSchema), transactionController.swapTokens);
router.get('/history/:address', authenticateToken, validateParams(addressParamSchema), validateQuery(paginationQuerySchema), transactionController.getTransactionHistory);
router.get('/:txHash', authenticateToken, validateParams(txHashParamSchema), transactionController.getTransactionDetails);

module.exports = router;
