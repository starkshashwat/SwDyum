// ============================================================================
// middleware/rateLimiter.js
// ----------------------------------------------------------------------------
// Two express-rate-limit instances:
//   - globalLimiter: a moderate limiter applied to the entire app, guarding
//     against generic abuse/scraping of the API.
//   - authLoginLimiter: a STRICT limiter applied only to POST /auth/login,
//     since login endpoints are the most common brute-force target.
//
// Limits are configurable via env vars (see config/env.js) with sensible
// hardcoded fallbacks so the app is safe by default even if env vars are
// not set.
// ============================================================================

import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * globalLimiter
 * Applied to all routes in server.js. Default: 100 requests / 15 minutes
 * per IP. Generous enough not to disrupt normal admin/API usage, but
 * enough to blunt basic scraping/abuse attempts.
 */
export const globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true, // return rate limit info in RateLimit-* headers
    legacyHeaders: false, // disable deprecated X-RateLimit-* headers
    message: { error: 'Too many requests. Please try again later.' },
});

/**
 * authLoginLimiter
 * Applied ONLY to POST /auth/login. Default: 10 requests / 15 minutes per
 * IP — deliberately strict to slow down credential-stuffing / brute-force
 * password guessing attempts against real user accounts.
 */
export const authLoginLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MIN * 60 * 1000,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again later.' },
});
