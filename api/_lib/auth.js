const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

const strings = {
  accessTokenRequired: 'Access token required',
  invalidToken: 'Invalid token',
};

/**
 * Verify authentication token from cookies
 * @param {Object} req - Vercel request object
 * @returns {Object|null} - User object if valid, null if invalid
 */
function verifyAuth(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) {
    return null;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return user;
  } catch {
    return null;
  }
}

/**
 * Parse cookies from cookie header string
 * @param {string} cookieHeader - Cookie header string
 * @returns {Object} - Parsed cookies
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Create Set-Cookie header value
 * @param {string} token - JWT token
 * @returns {string} - Cookie header value
 */
function createAuthCookie(token) {
  const options = [];
  options.push(`auth_token=${token}`);
  options.push(`Max-Age=${COOKIE_OPTIONS.maxAge / 1000}`);
  options.push(`Path=${COOKIE_OPTIONS.path}`);
  if (COOKIE_OPTIONS.httpOnly) options.push('HttpOnly');
  if (COOKIE_OPTIONS.secure) options.push('Secure');
  if (COOKIE_OPTIONS.sameSite) options.push(`SameSite=${COOKIE_OPTIONS.sameSite}`);
  return options.join('; ');
}

/**
 * Create Clear Cookie header value (for logout)
 * @returns {string} - Cookie header value
 */
function clearAuthCookie() {
  return 'auth_token=; Max-Age=0; Path=/; HttpOnly';
}

/**
 * Middleware-style auth check - returns error response if not authenticated
 * @param {Object} req - Vercel request
 * @param {Object} res - Vercel response
 * @returns {Object|null} - User if authenticated, sends error response if not
 */
function requireAuth(req, res) {
  const user = verifyAuth(req);
  if (!user) {
    res.status(401).json({ error: strings.accessTokenRequired });
    return null;
  }
  return user;
}

module.exports = {
  verifyAuth,
  generateToken,
  createAuthCookie,
  clearAuthCookie,
  requireAuth,
  JWT_SECRET,
  COOKIE_OPTIONS,
};
