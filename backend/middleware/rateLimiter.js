import rateLimit from 'express-rate-limit';

const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * Stricter rate limiter for auth endpoints — 5 attempts per 15 minutes per IP (100 in dev/test for test runners).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 100 : 5,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
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
