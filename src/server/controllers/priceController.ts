import { Request, Response } from 'express';
import db from '../config/db';
import queries from '../queries';
import { strings } from '../locales/strings';

interface PriceData {
  price: string;
  change24h: number;
}

interface PriceRow {
  token_symbol: string;
  price_usd: string;
  last_updated: string;
}

// Simulated price data for MVP
const MOCK_PRICES: Record<string, PriceData> = {
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

// Update price cache (should be called periodically)
const updatePriceCache = async (): Promise<void> => {
  try {
    for (const [symbol, data] of Object.entries(MOCK_PRICES)) {
      await db.query(queries.price.upsertPriceCache, [symbol, data.price]);
    }
    console.log('Price cache updated');
  } catch (error) {
    console.error('Error updating price cache:', error);
  }
};

// Initialize price cache on startup
updatePriceCache();

// Update prices every 30 seconds (for demo purposes)
setInterval(updatePriceCache, 30000);

// Get current prices for multiple tokens
export const getPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Set cache headers to reduce redundant requests
    res.set('Cache-Control', 'public, max-age=10');

    const symbolsQuery = req.query.symbols as string | undefined;
    const symbols = symbolsQuery ? symbolsQuery.split(',') : Object.keys(MOCK_PRICES);

    const result = await db.query<PriceRow>(queries.price.findPricesBySymbols, [symbols]);

    // Add change data from mock
    const pricesWithChange = result.rows.map(row => ({
      symbol: row.token_symbol,
      price: row.price_usd,
      change24h: MOCK_PRICES[row.token_symbol]?.change24h || 0,
      lastUpdated: row.last_updated,
    }));

    res.json({
      success: true,
      prices: pricesWithChange,
    });
  } catch (error) {
    console.error('Error getting prices:', error);
    res.status(500).json({
      success: false,
      error: strings.price.failedToGetPrices,
    });
  }
};

// Get price for specific token
export const getTokenPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;

    const result = await db.query<PriceRow>(queries.price.findPriceBySymbol, [
      symbol.toUpperCase(),
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: strings.price.notFoundForToken,
      });
      return;
    }

    res.json({
      success: true,
      price: {
        symbol: result.rows[0].token_symbol,
        price: result.rows[0].price_usd,
        change24h: MOCK_PRICES[result.rows[0].token_symbol]?.change24h || 0,
        lastUpdated: result.rows[0].last_updated,
      },
    });
  } catch (error) {
    console.error('Error getting token price:', error);
    res.status(500).json({
      success: false,
      error: strings.price.failedToGetTokenPrice,
    });
  }
};

// Get price history (simulated for MVP)
export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days as string) || 7;

    // Get current price
    const result = await db.query<PriceRow>(queries.price.findPriceBySymbol, [
      symbol.toUpperCase(),
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: strings.price.notFoundForToken,
      });
      return;
    }

    const currentPrice = parseFloat(result.rows[0].price_usd);

    // Generate simulated historical data
    const history: Array<{ timestamp: string; price: string }> = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = days - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * dayMs);
      // Add some random variation (±5%)
      const variation = (Math.random() - 0.5) * 0.1;
      const price = (currentPrice * (1 + variation)).toFixed(2);

      history.push({
        timestamp: timestamp.toISOString(),
        price: price,
      });
    }

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      history,
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      success: false,
      error: strings.price.failedToGetHistory,
    });
  }
};
