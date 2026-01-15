import express from 'express';
import * as priceController from '../controllers/priceController';

const router = express.Router();

router.get('/', priceController.getPrices);
router.get('/:symbol', priceController.getTokenPrice);
router.get('/:symbol/history', priceController.getPriceHistory);

export default router;
