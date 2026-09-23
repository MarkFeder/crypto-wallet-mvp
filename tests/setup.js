// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

// Test-only encryption key (32 bytes hex). Never reuse this outside tests.
process.env.MNEMONIC_ENCRYPTION_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  generateTestUser: () => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  }),
  generateTestWallet: () => ({
    name: `Test Wallet ${Date.now()}`,
  }),
};
