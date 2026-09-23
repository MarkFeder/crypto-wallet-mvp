const db = require('../../_lib/db');
const { requireAuth } = require('../../_lib/auth');
const { setCorsHeaders } = require('../../_lib/cors');

const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
};

const queries = {
  // Scoped by user_id: without this any authenticated user could read any
  // wallet's transaction history.
  findWalletByIdAndUserId: `
    SELECT id, name, created_at
    FROM wallets
    WHERE id = $1 AND user_id = $2
  `,
  findAddressesByWalletId: `
    SELECT currency, address, balance
    FROM wallet_addresses
    WHERE wallet_id = $1
    ORDER BY currency
  `,
  // Same text as /transactions/:address, and deliberately so — it is the only
  // transaction query with production evidence behind it. Do not "correct" the
  // column names here in isolation; see the schema note in the plan.
  findTransactionsByAddress: `
    SELECT tx_hash, from_address, to_address, amount, token_symbol, status, timestamp
    FROM transactions
    WHERE wallet_address = $1 OR from_address = $1 OR to_address = $1
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
    const { id } = req.query;
    const walletId = parseInt(id, 10);
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const offset = parseInt(req.query.offset) || PAGINATION.DEFAULT_OFFSET;

    if (isNaN(walletId) || walletId <= 0) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    // Confirm ownership before reading anything belonging to the wallet.
    const walletResult = await db.query(queries.findWalletByIdAndUserId, [walletId, user.id]);
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const addressesResult = await db.query(queries.findAddressesByWalletId, [walletId]);
    const ownedAddresses = addressesResult.rows.map(row => row.address);
    const owned = new Set(ownedAddresses);

    // A transfer is stored once, against the address that initiated it, so the
    // history has to be gathered per address. Note limit/offset are applied per
    // address rather than across the merged set.
    const perAddress = await Promise.all(
      ownedAddresses.map(address =>
        db.query(queries.findTransactionsByAddress, [address, limit, offset])
      )
    );

    // A transfer between two addresses of this same wallet matches twice;
    // de-duplicate on tx_hash so it is listed once.
    const seen = new Set();
    const merged = [];
    for (const result of perAddress) {
      for (const row of result.rows) {
        if (seen.has(row.tx_hash)) continue;
        seen.add(row.tx_hash);
        merged.push(row);
      }
    }

    // Each per-address query is already ordered, but the merged list is not.
    // `|| 0` keeps a null timestamp from poisoning the comparator with NaN.
    const timeOf = tx => new Date(tx.timestamp).getTime() || 0;
    merged.sort((a, b) => timeOf(b) - timeOf(a));

    // The query returns token_symbol and no id, but the client renders
    // tx.currency, keys on tx.id, and branches on tx.type — so derive all three.
    const transactions = merged.map((row, index) => ({
      ...row,
      id: index + 1,
      currency: row.token_symbol,
      type: owned.has(row.from_address) ? 'send' : 'receive',
    }));

    return res.status(200).json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    return res.status(500).json({ error: 'Failed to get wallet transactions' });
  }
};
