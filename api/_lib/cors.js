/**
 * CORS configuration for Vercel serverless functions
 */

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5000',
];

/**
 * Set CORS headers on response
 * @param {Object} req - Vercel request
 * @param {Object} res - Vercel response
 * @returns {boolean} - true if preflight request was handled
 */
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same origin requests don't have Origin header
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

module.exports = { setCorsHeaders, allowedOrigins };
