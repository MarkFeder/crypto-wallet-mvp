const fs = require('fs');
const path = require('path');
const { pool } = require('../src/server/config/db');

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database initialization...');
    console.log('📍 Connected to database:', process.env.DB_NAME || 'crypto_wallet');

    // Read schema file
    const schemaPath = path.join(__dirname, '../src/server/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing schema from:', schemaPath);

    // Begin transaction
    await client.query('BEGIN');

    // Execute schema
    await client.query(schema);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ Database schema created successfully!');

    // Verify tables
    const tableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Created tables:');
    tableCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check indexes
    const indexCheck = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname;
    `);

    console.log('🔍 Created indexes:');
    indexCheck.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });

    console.log('\n✅ Database initialization completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database initialization failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Please check:');
      console.error('   - PostgreSQL is running');
      console.error('   - Database credentials in .env file are correct');
      console.error('   - Database host and port are accessible');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Please create it first:');
      console.error(`   createdb ${process.env.DB_NAME || 'crypto_wallet'}`);
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Please check database credentials in .env');
    }

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🔥 Fatal error:', error);
    process.exit(1);
  });
