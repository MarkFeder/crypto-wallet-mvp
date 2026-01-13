const db = require('../_lib/db');
const { setCorsHeaders } = require('../_lib/cors');

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
  DOT: { price: '7.35', change24h: -2.1 },
};

const queries = {
  findPricesBySymbols: `
    SELECT token_symbol, price_usd, last_updated
    FROM price_cache
    WHERE token_symbol = ANY($1)
    ORDER BY token_symbol
  `,
  findPriceBySymbol: `
    SELECT token_symbol, price_usd, last_updated
    FROM price_cache
    WHERE token_symbol = $1
  `,
  upsertPriceCache: `
    INSERT INTO price_cache (token_symbol, price_usd, last_updated)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (token_symbol)
    DO UPDATE SET price_usd = $2, last_updated = CURRENT_TIMESTAMP
  `,
};

// Ensure price cache is populated
async function ensurePriceCache() {
  try {
    const result = await db.query(queries.findPricesBySymbols, [Object.keys(MOCK_PRICES)]);

    // If no prices in cache, populate them
    if (result.rows.length === 0) {
      for (const [symbol, data] of Object.entries(MOCK_PRICES)) {
        await db.query(queries.upsertPriceCache, [symbol, data.price]);
      }
    }
  } catch (error) {
    console.error('Error ensuring price cache:', error);
  }
}

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Set cache headers
  res.setHeader('Cache-Control', 'public, max-age=10');

  if (req.method === 'GET') {
    try {
      // Ensure prices exist
      await ensurePriceCache();

      const { symbols, symbol } = req.query;

      // Single symbol lookup
      if (symbol) {
        const result = await db.query(queries.findPriceBySymbol, [symbol.toUpperCase()]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Price not found for token',
          });
        }

        return res.status(200).json({
          success: true,
          price: {
            symbol: result.rows[0].token_symbol,
            price: result.rows[0].price_usd,
            change24h: MOCK_PRICES[result.rows[0].token_symbol]?.change24h || 0,
            lastUpdated: result.rows[0].last_updated,
          },
        });
      }

      // Multiple symbols lookup
      const symbolList = symbols ? symbols.split(',') : Object.keys(MOCK_PRICES);
      const result = await db.query(queries.findPricesBySymbols, [symbolList]);

      const pricesWithChange = result.rows.map(row => ({
        symbol: row.token_symbol,
        price: row.price_usd,
        change24h: MOCK_PRICES[row.token_symbol]?.change24h || 0,
        lastUpdated: row.last_updated,
      }));

      return res.status(200).json({
        success: true,
        prices: pricesWithChange,
      });
    } catch (error) {
      console.error('Get prices error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get prices',
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
