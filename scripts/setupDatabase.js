const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/server/config/db');
const cryptoUtils = require('../src/server/utils/crypto-utils');

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting complete database setup...');
    console.log('📍 Database:', process.env.DB_NAME || 'crypto_wallet');

    // Step 1: Drop all tables
    console.log('\n🗑️  Step 1/2: Dropping existing tables...');
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS transactions CASCADE;');
    await client.query('DROP TABLE IF EXISTS wallet_addresses CASCADE;');
    await client.query('DROP TABLE IF EXISTS wallets CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    await client.query('DROP TABLE IF EXISTS price_cache CASCADE;');

    console.log('   ✓ All tables dropped');

    // Step 2: Create fresh schema
    console.log('\n📄 Creating fresh schema...');
    const schemaPath = path.join(__dirname, '../src/server/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('   ✓ Schema created');

    await client.query('COMMIT');

    // Step 3: Seed data
    console.log('\n🌱 Step 2/2: Seeding database...');
    await client.query('BEGIN');

    // Seed cryptocurrency prices
    console.log('   💰 Adding cryptocurrency prices...');
    const prices = [
      { symbol: 'BTC', price: 45000.00, change: 2.5 },
      { symbol: 'ETH', price: 2800.00, change: 1.8 },
      { symbol: 'USDT', price: 1.00, change: 0.0 },
      { symbol: 'USDC', price: 1.00, change: 0.0 },
      { symbol: 'BNB', price: 350.00, change: 3.2 },
      { symbol: 'SOL', price: 120.00, change: 5.5 },
      { symbol: 'XRP', price: 0.65, change: -1.2 },
      { symbol: 'ADA', price: 0.55, change: 1.5 },
      { symbol: 'DOGE', price: 0.08, change: -0.5 },
      { symbol: 'DOT', price: 8.50, change: 2.1 }
    ];

    for (const price of prices) {
      await client.query(
        `INSERT INTO price_cache (token_symbol, price_usd, change_24h)
         VALUES ($1, $2, $3)`,
        [price.symbol, price.price, price.change]
      );
    }
    console.log('   ✓ Added 10 cryptocurrency prices');

    // Create test user
    console.log('   👤 Creating test admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userResult = await client.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['admin', 'admin@test.com', hashedPassword]
    );
    const userId = userResult.rows[0].id;
    console.log('   ✓ User created');

    // Create sample wallets
    console.log('   💼 Creating sample wallets...');
    const mnemonic = cryptoUtils.generateMnemonic();
    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    // Main Wallet
    const wallet1Result = await client.query(
      `INSERT INTO wallets (user_id, name, encrypted_mnemonic)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, 'My Main Wallet', mnemonic]
    );
    const wallet1Id = wallet1Result.rows[0].id;

    await client.query(
      `INSERT INTO wallet_addresses (wallet_id, currency, address, balance)
       VALUES ($1, $2, $3, $4), ($1, $5, $6, $7), ($1, $8, $6, $9)`,
      [wallet1Id, 'BTC', btcAddress.address, 0.5, 'ETH', ethAddress.address, 5.25, 'USDT', 1000.00]
    );

    await client.query(
      `INSERT INTO transactions (wallet_id, currency, type, amount, from_address, to_address, tx_hash, status)
       VALUES ($1, 'BTC', 'receive', 0.5, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', $2, '0x' || md5(random()::text)::text, 'confirmed'),
              ($1, 'ETH', 'receive', 5.25, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', $3, '0x' || md5(random()::text)::text, 'confirmed')`,
      [wallet1Id, btcAddress.address, ethAddress.address]
    );

    // Trading Wallet
    const mnemonic2 = cryptoUtils.generateMnemonic();
    const btcAddress2 = cryptoUtils.deriveBitcoinAddress(mnemonic2);
    const ethAddress2 = cryptoUtils.deriveEthereumAddress(mnemonic2);

    const wallet2Result = await client.query(
      `INSERT INTO wallets (user_id, name, encrypted_mnemonic)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, 'Trading Wallet', mnemonic2]
    );
    const wallet2Id = wallet2Result.rows[0].id;

    await client.query(
      `INSERT INTO wallet_addresses (wallet_id, currency, address, balance)
       VALUES ($1, 'BTC', $2, 0.25), ($1, 'ETH', $3, 2.5), ($1, 'USDC', $3, 5000.00), ($1, 'SOL', $3, 100.00)`,
      [wallet2Id, btcAddress2.address, ethAddress2.address]
    );

    console.log('   ✓ Created 2 wallets with balances');

    await client.query('COMMIT');

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email:    admin@test.com');
    console.log('   Password: admin123');
    console.log('\n🎯 You can now start your application with: npm run dev');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database setup failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🔥 Fatal error:', error);
    process.exit(1);
  });

