// ============================================================================
// middleware/auth.js
// ----------------------------------------------------------------------------
// Verifies the `Authorization: Bearer <token>` header against Supabase Auth
// using the ANON-key client's supabase.auth.getUser(token) method. This is
// the officially supported way to verify a Supabase session JWT server-side
// — we deliberately do NOT hand-roll JWT signature verification ourselves,
// since Supabase's SDK already does this correctly (including checking
// expiry, signature against the project's JWT secret, etc.).
//
// Two variants are exported:
//   - requireAuth: 401s if no valid token is present. Use on routes that
//     must always know who the caller is (e.g. everything gated behind
//     requireAdmin, or GET /auth/session).
//   - optionalAuth: attaches req.user if a valid token is present, but does
//     NOT reject the request if the header is missing or invalid. Use on
//     public catalog GET routes so the public frontend can call them
//     anonymously (Phase 6) while still allowing a logged-in user's identity
//     to be known if they happen to send a token.
// ============================================================================

import { supabaseAnon } from '../config/supabaseClient.js';
import { logger } from '../utils/logger.js';

/**
 * Extracts the bearer token from the Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null} the raw token string, or null if not present/malformed.
 */
function extractBearerToken(req) {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || typeof header !== 'string') return null;

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    return token.trim();
}

/**
 * requireAuth
 * Express middleware. Requires a valid bearer token. On success, attaches
 * the verified Supabase user object to `req.user` and calls next(). On
 * failure (missing header, invalid/expired token), responds 401 JSON and
 * does NOT call next().
 */
export async function requireAuth(req, res, next) {
    const token = extractBearerToken(req);

    if (!token) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header. Expected "Bearer <token>".' });
    }

    try {
        const { data, error } = await supabaseAnon.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({ error: 'Invalid or expired authentication token.' });
        }

        // Attach the verified user to the request for downstream middleware
        // (requireAdmin) and controllers to use.
        req.user = data.user;
        // Keep the raw token around in case a downstream handler needs to make
        // an RLS-respecting call on behalf of the user (not currently used, but
        // documented here for future use).
        req.token = token;

        return next();
    } catch (err) {
        logger.error('requireAuth: unexpected error verifying token', { message: err.message });
        return res.status(401).json({ error: 'Unable to verify authentication token.' });
    }
}

/**
 * optionalAuth
 * Express middleware. If a valid bearer token is present, attaches
 * `req.user` (same as requireAuth). If the header is missing or the token
 * is invalid, silently proceeds with `req.user` left undefined — the
 * request is NOT rejected. Use this on public GET routes for catalog data
 * where anonymous access must be allowed, but we'd still like to know the
 * caller's identity if they happen to be logged in.
 */
export async function optionalAuth(req, res, next) {
    const token = extractBearerToken(req);

    if (!token) {
        return next();
    }

    try {
        const { data, error } = await supabaseAnon.auth.getUser(token);
        if (!error && data?.user) {
            req.user = data.user;
            req.token = token;
        }
    } catch (err) {
        // Swallow errors here — optionalAuth must never block the request.
        logger.warn('optionalAuth: token present but verification failed', { message: err.message });
    }

    return next();
}
