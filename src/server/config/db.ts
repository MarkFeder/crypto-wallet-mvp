import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import 'dotenv/config';
import config from '../../config';

// Type for db config that handles both connection string and individual params
interface DbConfigWithConnectionString {
  connectionString: string | undefined;
  ssl: { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface DbConfigWithParams {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  ssl: boolean;
}

type DbConfig = DbConfigWithConnectionString | DbConfigWithParams;

function hasConnectionString(db: DbConfig): db is DbConfigWithConnectionString {
  return 'connectionString' in db && db.connectionString !== undefined;
}

// Build pool configuration based on environment
const dbConfig = config.db as DbConfig;

const poolConfig: PoolConfig = hasConnectionString(dbConfig)
  ? {
      // Cloud database (preview/production) - use connection string
      connectionString: dbConfig.connectionString,
      ssl: dbConfig.ssl,
      max: dbConfig.max,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
    }
  : {
      // Local database (development) - use individual params
      user: dbConfig.user,
      host: dbConfig.host,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port,
      ssl: dbConfig.ssl,
    };

// Remove undefined values
(Object.keys(poolConfig) as Array<keyof PoolConfig>).forEach(key => {
  if (poolConfig[key] === undefined) {
    delete poolConfig[key];
  }
});

const pool = new Pool(poolConfig);

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Log connection info in debug mode
if (config.debug) {
  pool.on('connect', () => {
    console.log(`[DB] Connected to ${config.env} database`);
  });
}

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => pool.query<T>(text, params);

export { pool };

export default {
  query,
  pool,
};
