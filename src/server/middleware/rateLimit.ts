import rateLimit from 'express-rate-limit';
import { strings } from '../locales/strings';

// Rate limiter for authentication endpoints (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: strings.rateLimit.tooManyLoginAttempts,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: strings.rateLimit.tooManyRequests,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for sensitive operations (transactions)
export const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 transactions per minute
  message: {
    success: false,
    error: strings.rateLimit.tooManyTransactionRequests,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
