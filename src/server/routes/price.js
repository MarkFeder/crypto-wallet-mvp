const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

router.get('/', priceController.getPrices);
router.get('/:symbol', priceController.getTokenPrice);
router.get('/:symbol/history', priceController.getPriceHistory);

module.exports = router;
