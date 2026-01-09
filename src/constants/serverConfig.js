// Server-side configuration constants (JavaScript version)
// This file mirrors the TypeScript config for use in Node.js server code

const TRANSACTION_CONFIG = {
  FEE_PERCENTAGE: 0.005, // 0.5% fee
  CONFIRMATION_DELAY: 2000, // 2 seconds for simulated confirmation
  DEFAULT_STATUS: 'pending',
};

const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  TRANSACTION_CONFIG,
  PAGINATION,
  HTTP_STATUS,
};
