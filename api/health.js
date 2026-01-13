const { setCorsHeaders } = require('./_lib/cors');

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'Crypto Wallet API is running',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};
