const db = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');

const findUserById = `
  SELECT id, username, email, created_at
  FROM users
  WHERE id = $1
`;

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const user = requireAuth(req, res);
    if (!user) return; // Response already sent by requireAuth

    // Get fresh user data from database
    const result = await db.query(findUserById, [user.id]);
    const userData = result.rows[0];

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
};
