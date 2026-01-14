const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function testConnection() {
  try {
    console.log('🔄 Testing PostgreSQL connection...');
    const result = await pool.query('SELECT version()');
    console.log('✅ PostgreSQL is running!');
    console.log('📦 Version:', result.rows[0].version);
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not running. Please start the service.');
    }
    process.exit(1);
  }
}

testConnection();
