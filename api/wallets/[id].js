const db = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');

const queries = {
  findWalletByIdAndUserId: `
    SELECT *
    FROM wallets
    WHERE id = $1 AND user_id = $2
  `,
  findAddressesByWalletId: `
    SELECT currency, address, balance
    FROM wallet_addresses
    WHERE wallet_id = $1
    ORDER BY currency
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
    // Get wallet ID from URL
    const { id } = req.query;
    const walletId = parseInt(id, 10);

    if (isNaN(walletId) || walletId <= 0) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    // Find wallet
    const walletResult = await db.query(queries.findWalletByIdAndUserId, [walletId, user.id]);

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];

    // Get addresses
    const addressesResult = await db.query(queries.findAddressesByWalletId, [walletId]);

    return res.status(200).json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          name: wallet.name,
          created_at: wallet.created_at,
          addresses: addressesResult.rows,
        },
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};
