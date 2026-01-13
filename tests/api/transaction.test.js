const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Mock the database before requiring controllers
jest.mock('../../src/server/config/db', () => require('../mocks/db'));

const transactionController = require('../../src/server/controllers/transactionController');
const { authenticateToken } = require('../../src/server/middleware/auth');
const { validate, validateParams, validateQuery } = require('../../src/server/middleware/validate');
const {
  sendTransactionSchema,
  addressParamSchema,
  txHashParamSchema,
  paginationQuerySchema,
} = require('../../src/server/schemas/transactionSchemas');
const { generateAuthToken } = require('../helpers');
const mockDb = require('../mocks/db');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cookieParser());

  // Transaction routes
  app.post(
    '/api/transactions/send',
    authenticateToken,
    validate(sendTransactionSchema),
    transactionController.sendTransaction
  );
  app.get(
    '/api/transactions/history/:address',
    authenticateToken,
    validateParams(addressParamSchema),
    validateQuery(paginationQuerySchema),
    transactionController.getTransactionHistory
  );
  app.get(
    '/api/transactions/:txHash',
    authenticateToken,
    validateParams(txHashParamSchema),
    transactionController.getTransactionDetails
  );

  // Error handler
  app.use((err, req, res, _next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
};

describe('Transaction API', () => {
  let app;
  let authToken;
  const testUser = { id: 1, username: 'testuser' };
  const validFromAddress = '0x1234567890123456789012345678901234567890';
  const validToAddress = '0x0987654321098765432109876543210987654321';

  beforeAll(() => {
    app = createTestApp();
    authToken = generateAuthToken(testUser);
  });

  beforeEach(() => {
    mockDb.resetStorage();
    mockDb.seedTestData(testUser);

    // Seed a wallet address with balance for transaction tests
    mockDb.storage.wallet_addresses.push({
      id: 1,
      wallet_id: 1,
      address: validFromAddress,
      currency: 'ETH',
      balance: '10.0',
    });

    jest.clearAllMocks();
  });

  describe('POST /api/transactions/send - Send Transaction', () => {
    it('should send a transaction successfully', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '0.5',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.txHash).toBeDefined();
      expect(response.body.transaction.txHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(response.body.transaction.from).toBe(txData.fromAddress);
      expect(response.body.transaction.to).toBe(txData.toAddress);
      expect(String(response.body.transaction.amount)).toBe(txData.amount);
      expect(response.body.transaction.status).toBe('pending');
    });

    it('should return 401 when not authenticated', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '0.5',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .send(txData);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid from address', async () => {
      const txData = {
        fromAddress: 'invalid-address',
        toAddress: validToAddress,
        amount: '0.5',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid to address', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: 'invalid-address',
        amount: '0.5',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.status).toBe(400);
    });

    it('should return 400 for zero amount', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '0',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative amount', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '-0.5',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.status).toBe(400);
    });

    it('should return 400 for insufficient balance', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '100.0', // More than the 10.0 balance
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient');
    });

    it('should return error for non-existent asset', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '0.5',
        tokenSymbol: 'NONEXISTENT',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      // API returns 400 for invalid token or 404 if asset not found
      expect([400, 404]).toContain(response.status);
    });

    it('should update sender balance after transaction', async () => {
      const initialBalance = '10.0';
      const txAmount = '0.5';

      await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({
          fromAddress: validFromAddress,
          toAddress: validToAddress,
          amount: txAmount,
          tokenSymbol: 'ETH',
        });

      // Check the balance was updated in mock storage
      const asset = mockDb.storage.wallet_addresses.find(
        (a) => a.address === validFromAddress && a.currency === 'ETH'
      );
      expect(parseFloat(asset.balance)).toBe(parseFloat(initialBalance) - parseFloat(txAmount));
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ fromAddress: validFromAddress });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/transactions/history/:address - Get Transaction History', () => {
    beforeEach(() => {
      // Seed some transactions
      mockDb.storage.transactions.push(
        {
          id: 1,
          wallet_address: validFromAddress,
          tx_hash: '0x' + '1'.repeat(64),
          from_address: validFromAddress,
          to_address: validToAddress,
          amount: '1.0',
          token_symbol: 'ETH',
          status: 'confirmed',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          wallet_address: validFromAddress,
          tx_hash: '0x' + '2'.repeat(64),
          from_address: validFromAddress,
          to_address: validToAddress,
          amount: '0.5',
          token_symbol: 'ETH',
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      );
    });

    it('should return transaction history for an address', async () => {
      const response = await request(app)
        .get(`/api/transactions/history/${validFromAddress}`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toBeDefined();
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });

    it('should return empty array for address with no transactions', async () => {
      const newAddress = '0x' + '9'.repeat(40);

      const response = await request(app)
        .get(`/api/transactions/history/${newAddress}`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.transactions).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/transactions/history/${validFromAddress}`);

      expect(response.status).toBe(401);
    });

    it('should support pagination with limit and offset', async () => {
      const response = await request(app)
        .get(`/api/transactions/history/${validFromAddress}?limit=10&offset=0`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.transactions).toBeDefined();
    });

    it('should return 400 for invalid address format', async () => {
      const response = await request(app)
        .get('/api/transactions/history/invalid-address')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/transactions/:txHash - Get Transaction Details', () => {
    const testTxHash = '0x' + 'a'.repeat(64);

    beforeEach(() => {
      mockDb.storage.transactions.push({
        id: 1,
        wallet_address: validFromAddress,
        tx_hash: testTxHash,
        from_address: validFromAddress,
        to_address: validToAddress,
        amount: '1.0',
        token_symbol: 'ETH',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      });
    });

    it('should return transaction details by hash', async () => {
      const response = await request(app)
        .get(`/api/transactions/${testTxHash}`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.tx_hash).toBe(testTxHash);
    });

    it('should return 404 for non-existent transaction', async () => {
      const nonExistentHash = '0x' + 'f'.repeat(64);

      const response = await request(app)
        .get(`/api/transactions/${nonExistentHash}`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/transactions/${testTxHash}`);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid transaction hash format', async () => {
      const response = await request(app)
        .get('/api/transactions/invalid-hash')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(400);
    });
  });

  describe('Transaction Status', () => {
    it('should create transaction with pending status', async () => {
      const txData = {
        fromAddress: validFromAddress,
        toAddress: validToAddress,
        amount: '0.5',
        tokenSymbol: 'ETH',
      };

      const response = await request(app)
        .post('/api/transactions/send')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(txData);

      expect(response.body.transaction.status).toBe('pending');
    });
  });
});
