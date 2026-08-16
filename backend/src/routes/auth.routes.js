// ============================================================================
// routes/auth.routes.js
// ----------------------------------------------------------------------------
// Route definitions for authentication endpoints. POST /login is protected
// by the STRICT authLoginLimiter (in addition to the global limiter applied
// app-wide) to slow down brute-force/credential-stuffing attempts.
// ============================================================================

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLoginLimiter } from '../middleware/rateLimiter.js';
import { loginSchema } from '../validators/auth.schema.js';
import { login, getSession, logout } from '../controllers/auth.controller.js';

const router = Router();

/** POST /auth/login — public, strictly rate-limited. */
router.post('/login', authLoginLimiter, validate(loginSchema), login);

/** GET /auth/session — requires a valid bearer token. */
router.get('/session', requireAuth, getSession);

/** POST /auth/logout — requires a valid bearer token. */
router.post('/logout', requireAuth, logout);

export default router;
