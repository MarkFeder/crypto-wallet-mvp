const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');

// Rate limiter instances (created lazily)
let redis = null;
let authLimiter = null;
let apiLimiter = null;

/**
 * Initialize Redis connection
 */
function getRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Get rate limiter for authentication endpoints (stricter)
 * 5 requests per 60 seconds per IP
 */
function getAuthLimiter() {
  if (!authLimiter && getRedis()) {
    authLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'ratelimit:auth',
    });
  }
  return authLimiter;
}

/**
 * Get rate limiter for general API endpoints (more lenient)
 * 30 requests per 60 seconds per IP
 */
function getApiLimiter() {
  if (!apiLimiter && getRedis()) {
    apiLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      analytics: true,
      prefix: 'ratelimit:api',
    });
  }
  return apiLimiter;
}

/**
 * Extract client IP from request
 */
function getClientIp(req) {
  // Vercel provides the real IP in x-forwarded-for
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || 'unknown';
}

/**
 * Apply rate limiting to a request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} type - 'auth' or 'api'
 * @returns {boolean} - true if rate limited (request should stop), false if allowed
 */
async function rateLimit(req, res, type = 'api') {
  const limiter = type === 'auth' ? getAuthLimiter() : getApiLimiter();

  // If rate limiting is not configured, allow the request but log warning
  if (!limiter) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Rate limiting not configured - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required');
    }
    return false;
  }

  const ip = getClientIp(req);
  const identifier = `${type}:${ip}`;

  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request to proceed
    return false;
  }
}

/**
 * Rate limit middleware for auth endpoints
 */
async function rateLimitAuth(req, res) {
  return rateLimit(req, res, 'auth');
}

/**
 * Rate limit middleware for general API endpoints
 */
async function rateLimitApi(req, res) {
  return rateLimit(req, res, 'api');
}

module.exports = {
  rateLimit,
  rateLimitAuth,
  rateLimitApi,
  getClientIp,
};
