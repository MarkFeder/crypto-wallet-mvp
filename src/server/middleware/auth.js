const jwt = require('jsonwebtoken');
const { strings } = require('../locales/strings');

// Security: Require JWT_SECRET from environment - no fallback
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

const authenticateToken = (req, res, next) => {
  // Read token from HttpOnly cookie instead of Authorization header
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: strings.auth.accessTokenRequired });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: strings.auth.invalidToken });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, JWT_SECRET, COOKIE_OPTIONS };
