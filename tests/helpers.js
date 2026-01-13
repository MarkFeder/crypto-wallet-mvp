const request = require('supertest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';

/**
 * Generate a valid JWT token for testing
 * @param {Object} user - User object with id and username
 * @returns {string} JWT token
 */
const generateAuthToken = (user = { id: 1, username: 'testuser' }) => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
};

/**
 * Create an authenticated agent for testing
 * @param {Object} app - Express app
 * @param {Object} user - User object
 * @returns {Object} Supertest agent with auth cookie
 */
const createAuthenticatedAgent = (app, user = { id: 1, username: 'testuser' }) => {
  const token = generateAuthToken(user);
  const agent = request.agent(app);
  agent.set('Cookie', [`auth_token=${token}`]);
  return agent;
};

/**
 * Make an authenticated request
 * @param {Object} app - Express app
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} user - User object
 * @returns {Object} Supertest request
 */
const authRequest = (app, method, url, user = { id: 1, username: 'testuser' }) => {
  const token = generateAuthToken(user);
  return request(app)
    [method](url)
    .set('Cookie', [`auth_token=${token}`]);
};

/**
 * Generate random test data
 */
const testData = {
  user: (overrides = {}) => ({
    id: Math.floor(Math.random() * 10000),
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    ...overrides,
  }),
  wallet: (overrides = {}) => ({
    name: `Test Wallet ${Date.now()}`,
    ...overrides,
  }),
  transaction: (overrides = {}) => ({
    fromAddress: '0x1234567890123456789012345678901234567890',
    toAddress: '0x0987654321098765432109876543210987654321',
    amount: '0.1',
    tokenSymbol: 'ETH',
    ...overrides,
  }),
};

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  generateAuthToken,
  createAuthenticatedAgent,
  authRequest,
  testData,
  wait,
};
