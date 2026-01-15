import express from 'express';
import * as walletController from '../controllers/walletController';
import { authenticateToken } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validate';
import { createWalletSchema, walletIdParamSchema } from '../schemas/walletSchemas';

const router = express.Router();

router.post('/', authenticateToken, validate(createWalletSchema), walletController.createWallet);
router.get('/', authenticateToken, walletController.getWallets);
router.get(
  '/:id',
  authenticateToken,
  validateParams(walletIdParamSchema),
  walletController.getWalletById
);

export default router;
