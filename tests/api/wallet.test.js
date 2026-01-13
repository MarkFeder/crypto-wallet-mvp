const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Mock the database before requiring controllers
jest.mock('../../src/server/config/db', () => require('../mocks/db'));

const walletController = require('../../src/server/controllers/walletController');
const { authenticateToken } = require('../../src/server/middleware/auth');
const { validate, validateParams } = require('../../src/server/middleware/validate');
const { createWalletSchema, walletIdParamSchema } = require('../../src/server/schemas/walletSchemas');
const { generateAuthToken } = require('../helpers');
const mockDb = require('../mocks/db');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cookieParser());

  // Wallet routes
  app.post('/api/wallets', authenticateToken, validate(createWalletSchema), walletController.createWallet);
  app.get('/api/wallets', authenticateToken, walletController.getWallets);
  app.get('/api/wallets/:id', authenticateToken, validateParams(walletIdParamSchema), walletController.getWalletById);

  // Error handler
  app.use((err, req, res, _next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
};

describe('Wallet API', () => {
  let app;
  let authToken;
  const testUser = { id: 1, username: 'testuser' };

  beforeAll(() => {
    app = createTestApp();
    authToken = generateAuthToken(testUser);
  });

  beforeEach(() => {
    mockDb.resetStorage();
    mockDb.seedTestData(testUser);
    jest.clearAllMocks();
  });

  describe('POST /api/wallets - Create Wallet', () => {
    it('should create a new wallet successfully', async () => {
      const walletData = { name: 'My First Wallet' };

      const response = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(walletData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.wallet).toBeDefined();
      expect(response.body.wallet.name).toBe(walletData.name);
      expect(response.body.mnemonic).toBeDefined();
      expect(response.body.addresses).toBeDefined();
      expect(response.body.addresses.BTC).toBeDefined();
      expect(response.body.addresses.ETH).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const walletData = { name: 'My Wallet' };

      const response = await request(app)
        .post('/api/wallets')
        .send(walletData);

      expect(response.status).toBe(401);
    });

    it('should return 400 when wallet name is missing', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 when wallet name is too long', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'a'.repeat(51) });

      expect(response.status).toBe(400);
    });

    it('should create wallet with valid name containing special characters', async () => {
      const walletData = { name: "John's Wallet #1" };

      const response = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(walletData);

      expect(response.status).toBe(201);
      expect(response.body.wallet.name).toBe(walletData.name);
    });
  });

  describe('GET /api/wallets - Get All Wallets', () => {
    it('should return empty array when user has no wallets', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.wallets).toEqual([]);
    });

    it('should return all wallets for authenticated user', async () => {
      // Create a wallet first
      await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'Wallet 1' });

      const response = await request(app)
        .get('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.wallets).toHaveLength(1);
      expect(response.body.wallets[0].addresses).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/wallets');

      expect(response.status).toBe(401);
    });

    it('should only return wallets belonging to the authenticated user', async () => {
      // Create wallet for user 1
      await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'User 1 Wallet' });

      // Create wallet for user 2
      const user2Token = generateAuthToken({ id: 2, username: 'testuser2' });
      await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${user2Token}`])
        .send({ name: 'User 2 Wallet' });

      // Get wallets for user 1
      const response = await request(app)
        .get('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.wallets).toHaveLength(1);
      expect(response.body.wallets[0].name).toBe('User 1 Wallet');
    });
  });

  describe('GET /api/wallets/:id - Get Wallet by ID', () => {
    it('should return wallet details by ID', async () => {
      // Create a wallet first
      const createResponse = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'My Wallet' });

      const walletId = createResponse.body.wallet.id;

      const response = await request(app)
        .get(`/api/wallets/${walletId}`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.wallet).toBeDefined();
      expect(response.body.wallet.id).toBe(walletId);
      expect(response.body.wallet.addresses).toBeDefined();
    });

    it('should return 404 for non-existent wallet', async () => {
      const response = await request(app)
        .get('/api/wallets/99999')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/wallets/1');

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid wallet ID format', async () => {
      const response = await request(app)
        .get('/api/wallets/invalid')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(400);
    });

    it('should not return wallet belonging to another user', async () => {
      // Create wallet for user 1
      const createResponse = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'User 1 Wallet' });

      const walletId = createResponse.body.wallet.id;

      // Try to access with user 2
      const user2Token = generateAuthToken({ id: 2, username: 'testuser2' });
      const response = await request(app)
        .get(`/api/wallets/${walletId}`)
        .set('Cookie', [`auth_token=${user2Token}`]);

      expect(response.status).toBe(404);
    });
  });

  describe('Wallet Creation - Mnemonic Generation', () => {
    it('should generate a 12-word mnemonic', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'Mnemonic Test Wallet' });

      expect(response.status).toBe(201);
      const mnemonic = response.body.mnemonic;
      expect(mnemonic).toBeDefined();
      expect(mnemonic.split(' ')).toHaveLength(12);
    });

    it('should generate unique mnemonics for different wallets', async () => {
      const response1 = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'Wallet 1' });

      const response2 = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'Wallet 2' });

      expect(response1.body.mnemonic).not.toBe(response2.body.mnemonic);
    });

    it('should generate valid BTC and ETH addresses', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Cookie', [`auth_token=${authToken}`])
        .send({ name: 'Address Test Wallet' });

      expect(response.status).toBe(201);
      const { addresses } = response.body;

      // BTC address validation (starts with 1, 3, or bc1)
      expect(addresses.BTC).toMatch(/^(1|3|bc1)/);

      // ETH address validation (starts with 0x and is 42 chars)
      expect(addresses.ETH).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});
