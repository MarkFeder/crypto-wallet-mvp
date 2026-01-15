import express from 'express';

import authRoutes from './auth';
import walletRoutes from './wallet';
import transactionRoutes from './transaction';
import priceRoutes from './price';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/prices', priceRoutes);

export default router;
