const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { pool } = require('../src/server/config/db');

async function confirmReset() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DELETE ALL DATA in the database!\nAre you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database reset...');
    console.log('📍 Database:', process.env.DB_NAME || 'crypto_wallet');

    // Confirm before proceeding
    const confirmed = await confirmReset();

    if (!confirmed) {
      console.log('\n❌ Reset cancelled by user.');
      return;
    }

    console.log('\n🗑️  Dropping existing tables...');

    // Begin transaction
    await client.query('BEGIN');

    // Drop tables in reverse order of dependencies
    await client.query('DROP TABLE IF EXISTS transactions CASCADE;');
    await client.query('DROP TABLE IF EXISTS wallet_addresses CASCADE;');
    await client.query('DROP TABLE IF EXISTS wallets CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');

    console.log('✅ Tables dropped successfully!');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../src/server/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Creating fresh schema...');
    await client.query(schema);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ Fresh schema created successfully!');

    // Verify tables
    const tableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Available tables:');
    tableCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✅ Database reset completed successfully!');
    console.log('💡 You can now start fresh with a clean database.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database reset failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Please check:');
      console.error('   - PostgreSQL is running');
      console.error('   - Database credentials in .env file are correct');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Please create it first:');
      console.error(`   createdb ${process.env.DB_NAME || 'crypto_wallet'}`);
    }

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🔥 Fatal error:', error);
    process.exit(1);
  });
