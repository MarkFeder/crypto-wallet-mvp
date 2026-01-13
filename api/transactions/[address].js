const db = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');

const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
};

const queries = {
  findTransactionsByAddress: `
    SELECT tx_hash, from_address, to_address, amount, token_symbol, status, timestamp
    FROM transactions
    WHERE wallet_address = $1
    ORDER BY timestamp DESC
    LIMIT $2 OFFSET $3
  `,
};

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { address } = req.query;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const offset = parseInt(req.query.offset) || PAGINATION.DEFAULT_OFFSET;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const result = await db.query(queries.findTransactionsByAddress, [address, limit, offset]);

    return res.status(200).json({
      success: true,
      data: {
        transactions: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    return res.status(500).json({ error: 'Failed to get transaction history' });
  }
};
