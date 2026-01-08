/**
 * Central export point for all database queries
 *
 * Benefits:
 * - Separation of SQL from business logic
 * - Easier to maintain and update queries
 * - Better testability
 * - Single source of truth for all queries
 */

const authQueries = require('./authQueries');
const walletQueries = require('./walletQueries');
const transactionQueries = require('./transactionQueries');
const priceQueries = require('./priceQueries');

module.exports = {
  auth: authQueries,
  wallet: walletQueries,
  transaction: transactionQueries,
  price: priceQueries,
};
