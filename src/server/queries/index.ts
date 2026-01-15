/**
 * Central export point for all database queries
 *
 * Benefits:
 * - Separation of SQL from business logic
 * - Easier to maintain and update queries
 * - Better testability
 * - Single source of truth for all queries
 */

import { authQueries } from './authQueries';
import { walletQueries } from './walletQueries';
import { transactionQueries } from './transactionQueries';
import { priceQueries } from './priceQueries';

export const queries = {
  auth: authQueries,
  wallet: walletQueries,
  transaction: transactionQueries,
  price: priceQueries,
};

export { authQueries, walletQueries, transactionQueries, priceQueries };

export default queries;
