const { clearAuthCookie } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear auth cookie
  res.setHeader('Set-Cookie', clearAuthCookie());

  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
};
