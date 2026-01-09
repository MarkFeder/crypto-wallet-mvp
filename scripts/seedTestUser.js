const bcrypt = require('bcryptjs');
const { pool } = require('../src/server/config/db');
const cryptoUtils = require('../src/server/utils/crypto-utils');

async function seedTestUser() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');
    console.log('📍 Connected to database:', process.env.DB_NAME || 'crypto_wallet');

    await client.query('BEGIN');

    // Create price_cache table if it doesn't exist
    console.log('\n📊 Setting up price_cache table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_cache (
        id SERIAL PRIMARY KEY,
        token_symbol VARCHAR(10) UNIQUE NOT NULL,
        price_usd DECIMAL(20, 8) NOT NULL,
        change_24h DECIMAL(10, 2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed initial prices
    console.log('💰 Seeding cryptocurrency prices...');
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
         VALUES ($1, $2, $3)
         ON CONFLICT (token_symbol) DO UPDATE
         SET price_usd = $2, change_24h = $3, last_updated = CURRENT_TIMESTAMP`,
        [price.symbol, price.price, price.change]
      );
    }
    console.log(`   ✓ Added ${prices.length} cryptocurrency prices`);

    // Check if test user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@test.com']
    );

    let userId;

    if (existingUser.rows.length > 0) {
      console.log('\n👤 Test user already exists, updating password...');
      userId = existingUser.rows[0].id;

      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, userId]
      );
      console.log('   ✓ Password updated');
    } else {
      console.log('\n👤 Creating test admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['admin', 'admin@test.com', hashedPassword]
      );

      userId = userResult.rows[0].id;
      console.log('   ✓ User created with ID:', userId);
    }

    // Create sample wallets
    console.log('\n💼 Creating sample wallets...');

    const mnemonic = cryptoUtils.generateMnemonic();
    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    // Wallet 1: Main Wallet
    const wallet1Result = await client.query(
      `INSERT INTO wallets (user_id, name, encrypted_mnemonic)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [userId, 'My Main Wallet', mnemonic]
    );

    if (wallet1Result.rows.length > 0) {
      const wallet1Id = wallet1Result.rows[0].id;
      console.log('   ✓ Main Wallet created (ID:', wallet1Id, ')');

      // Add BTC address with balance
      await client.query(
        `INSERT INTO wallet_addresses (wallet_id, currency, address, balance)
         VALUES ($1, $2, $3, $4)`,
        [wallet1Id, 'BTC', btcAddress.address, 0.5]
      );

      // Add ETH address with balance
      await client.query(
        `INSERT INTO wallet_addresses (wallet_id, currency, address, balance)
         VALUES ($1, $2, $3, $4)`,
        [wallet1Id, 'ETH', ethAddress.address, 5.25]
      );

      // Add USDT balance
      await client.query(
        `INSERT INTO wallet_addresses (wallet_id, currency, address, balance)
         VALUES ($1, $2, $3, $4)`,
        [wallet1Id, 'USDT', ethAddress.address, 1000.00]
      );

      console.log('   ✓ Added BTC, ETH, and USDT addresses with balances');

      // Add sample transactions
      await client.query(
        `INSERT INTO transactions (wallet_id, currency, type, amount, from_address, to_address, tx_hash, status)
         VALUES
           ($1, 'BTC', 'receive', 0.5, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', $2, '0x' || md5(random()::text)::text, 'confirmed'),
           ($1, 'ETH', 'receive', 5.25, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', $3, '0x' || md5(random()::text)::text, 'confirmed')`,
        [wallet1Id, btcAddress.address, ethAddress.address]
      );

      console.log('   ✓ Added sample transactions');
    }

    // Wallet 2: Trading Wallet
    const mnemonic2 = cryptoUtils.generateMnemonic();
    const btcAddress2 = cryptoUtils.deriveBitcoinAddress(mnemonic2);
    const ethAddress2 = cryptoUtils.deriveEthereumAddress(mnemonic2);

    const wallet2Result = await client.query(
      `INSERT INTO wallets (user_id, name, encrypted_mnemonic)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [userId, 'Trading Wallet', mnemonic2]
    );

    if (wallet2Result.rows.length > 0) {
      const wallet2Id = wallet2Result.rows[0].id;
      console.log('   ✓ Trading Wallet created (ID:', wallet2Id, ')');

      // Add addresses with different balances
      await client.query(
        `INSERT INTO wallet_addresses (wallet_id, currency, address, balance)
         VALUES
           ($1, 'BTC', $2, 0.25),
           ($1, 'ETH', $3, 2.5),
           ($1, 'USDC', $3, 5000.00),
           ($1, 'SOL', $3, 100.00)`,
        [wallet2Id, btcAddress2.address, ethAddress2.address]
      );

      console.log('   ✓ Added BTC, ETH, USDC, and SOL addresses');
    }

    await client.query('COMMIT');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email:    admin@test.com');
    console.log('   Password: admin123');
    console.log('\n💡 You can now log in to the application with these credentials.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database seeding failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedTestUser()
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🔥 Fatal error:', error);
    process.exit(1);
  });
