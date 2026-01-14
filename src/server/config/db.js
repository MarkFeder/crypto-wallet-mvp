const { Pool } = require('pg');
require('dotenv').config();

const config = require('../../config');

// Build pool configuration based on environment
const poolConfig = config.db.connectionString
  ? {
      // Cloud database (preview/production) - use connection string
      connectionString: config.db.connectionString,
      ssl: config.db.ssl,
      max: config.db.max,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      connectionTimeoutMillis: config.db.connectionTimeoutMillis,
    }
  : {
      // Local database (development) - use individual params
      user: config.db.user,
      host: config.db.host,
      database: config.db.database,
      password: config.db.password,
      port: config.db.port,
      ssl: config.db.ssl,
    };

// Remove undefined values
Object.keys(poolConfig).forEach(key => {
  if (poolConfig[key] === undefined) {
    delete poolConfig[key];
  }
});

const pool = new Pool(poolConfig);

pool.on('error', err => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Log connection info in debug mode
if (config.debug) {
  pool.on('connect', () => {
    console.log(`[DB] Connected to ${config.env} database`);
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
