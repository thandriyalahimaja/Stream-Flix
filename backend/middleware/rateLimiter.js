import rateLimit from 'express-rate-limit';

const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * Stricter rate limiter for auth endpoints (register and login) — 20 attempts per 15 minutes in production (100 in dev/test).
 * Note: Refresh token calls are not routed through this rate limiter.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 100 : 20,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict resource rate limiter for media uploads — 5 uploads per 15 minutes per IP (100 in dev/test for test runners).
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 100 : 5,
  message: { success: false, message: 'Too many upload attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter — 200 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, message: 'Rate limit exceeded. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
