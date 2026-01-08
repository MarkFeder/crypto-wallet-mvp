const db = require('../config/db');
const queries = require('../queries');

// Simulated price data for MVP
const MOCK_PRICES = {
  BTC: { price: '43250.50', change24h: 2.5 },
  ETH: { price: '2280.75', change24h: -1.2 },
  USDT: { price: '1.00', change24h: 0.01 },
  USDC: { price: '1.00', change24h: -0.01 },
  BNB: { price: '312.40', change24h: 3.1 },
  SOL: { price: '98.25', change24h: 5.7 },
  XRP: { price: '0.58', change24h: 1.8 },
  ADA: { price: '0.52', change24h: -0.5 },
  DOGE: { price: '0.089', change24h: 4.2 },
  DOT: { price: '7.35', change24h: -2.1 }
};

// Update price cache (should be called periodically)
const updatePriceCache = async () => {
  try {
    for (const [symbol, data] of Object.entries(MOCK_PRICES)) {
      await db.query(queries.price.upsertPriceCache, [symbol, data.price]);
    }
    console.log('✅ Price cache updated');
  } catch (error) {
    console.error('❌ Error updating price cache:', error);
  }
};

// Initialize price cache on startup
updatePriceCache();

// Update prices every 30 seconds (for demo purposes)
setInterval(updatePriceCache, 30000);

// Get current prices for multiple tokens
exports.getPrices = async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : Object.keys(MOCK_PRICES);

    const result = await db.query(queries.price.findPricesBySymbols, [symbols]);

    // Add change data from mock
    const pricesWithChange = result.rows.map(row => ({
      symbol: row.token_symbol,
      price: row.price_usd,
      change24h: MOCK_PRICES[row.token_symbol]?.change24h || 0,
      lastUpdated: row.last_updated
    }));

    res.json({
      success: true,
      prices: pricesWithChange
    });
  } catch (error) {
    console.error('Error getting prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get prices'
    });
  }
};

// Get price for specific token
exports.getTokenPrice = async (req, res) => {
  try {
    const { symbol } = req.params;

    const result = await db.query(queries.price.findPriceBySymbol, [symbol.toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Price not found for token'
      });
    }

    res.json({
      success: true,
      price: {
        symbol: result.rows[0].token_symbol,
        price: result.rows[0].price_usd,
        change24h: MOCK_PRICES[result.rows[0].token_symbol]?.change24h || 0,
        lastUpdated: result.rows[0].last_updated
      }
    });
  } catch (error) {
    console.error('Error getting token price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token price'
    });
  }
};

// Get price history (simulated for MVP)
exports.getPriceHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days) || 7;

    // Get current price
    const result = await db.query(queries.price.findPriceBySymbol, [symbol.toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Price not found for token'
      });
    }

    const currentPrice = parseFloat(result.rows[0].price_usd);
    
    // Generate simulated historical data
    const history = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = days - 1; i >= 0; i--) {
      const timestamp = new Date(now - (i * dayMs));
      // Add some random variation (±5%)
      const variation = (Math.random() - 0.5) * 0.1;
      const price = (currentPrice * (1 + variation)).toFixed(2);
      
      history.push({
        timestamp: timestamp.toISOString(),
        price: price
      });
    }
    
    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      history
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get price history'
    });
  }
};

module.exports = exports;
