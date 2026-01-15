import express from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import {
  sendTransactionSchema,
  swapTokensSchema,
  addressParamSchema,
  txHashParamSchema,
  paginationQuerySchema,
} from '../schemas/transactionSchemas';

const router = express.Router();

router.post(
  '/send',
  authenticateToken,
  validate(sendTransactionSchema),
  transactionController.sendTransaction
);
router.post(
  '/swap',
  authenticateToken,
  validate(swapTokensSchema),
  transactionController.swapTokens
);
router.get(
  '/history/:address',
  authenticateToken,
  validateParams(addressParamSchema),
  validateQuery(paginationQuerySchema),
  transactionController.getTransactionHistory
);
router.get(
  '/:txHash',
  authenticateToken,
  validateParams(txHashParamSchema),
  transactionController.getTransactionDetails
);

export default router;
