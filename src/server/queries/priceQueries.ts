/**
 * Price-related database queries
 */

export const priceQueries = {
  // Upsert price in cache
  upsertPriceCache: `
    INSERT INTO price_cache (token_symbol, price_usd, last_updated)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (token_symbol)
    DO UPDATE SET price_usd = $2, last_updated = CURRENT_TIMESTAMP
  `,

  // Get prices for multiple tokens
  findPricesBySymbols: `
    SELECT token_symbol, price_usd, last_updated
    FROM price_cache
    WHERE token_symbol = ANY($1)
    ORDER BY token_symbol
  `,

  // Get price for single token
  findPriceBySymbol: `
    SELECT token_symbol, price_usd, last_updated
    FROM price_cache
    WHERE token_symbol = $1
  `,

  // Get all cached prices
  findAllPrices: `
    SELECT token_symbol, price_usd, last_updated
    FROM price_cache
    ORDER BY token_symbol
  `,

  // Delete stale prices (older than X hours)
  deleteStalePrices: `
    DELETE FROM price_cache
    WHERE last_updated < NOW() - INTERVAL '24 hours'
  `,
} as const;

export default priceQueries;
