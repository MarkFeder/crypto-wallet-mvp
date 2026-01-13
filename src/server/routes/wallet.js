const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validate');
const { createWalletSchema, walletIdParamSchema } = require('../schemas/walletSchemas');

router.post('/', authenticateToken, validate(createWalletSchema), walletController.createWallet);
router.get('/', authenticateToken, walletController.getWallets);
router.get(
  '/:id',
  authenticateToken,
  validateParams(walletIdParamSchema),
  walletController.getWalletById
);

module.exports = router;
