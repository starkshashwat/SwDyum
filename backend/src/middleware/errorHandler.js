// ============================================================================
// middleware/errorHandler.js
// ----------------------------------------------------------------------------
// Centralized Express error-handling middleware (4-arg signature). Every
// asyncHandler-wrapped controller that throws (including re-thrown Supabase
// `{ error }` results) ends up here via next(err).
//
// Security-critical behavior:
//   - In production (NODE_ENV=production), responses are reduced to a
//     generic `{ error: message }` shape — NEVER a stack trace, NEVER a raw
//     Postgres/Supabase error object (which can leak schema/column names,
//     constraint names, or internal details to an attacker).
//   - In development, we include the stack trace and any extra detail to
//     make debugging easier.
//   - SUPABASE_SERVICE_ROLE_KEY or any secret must NEVER appear in an error
//     response body; since we never attach secrets to error objects
//     ourselves, and Supabase client errors don't include credentials, this
//     is satisfied by construction — but keep this in mind if extending.
//
// Must be registered LAST in server.js, after all routes and the 404
// handler, per Express error-handling middleware conventions.
// ============================================================================

import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * errorHandler(err, req, res, next)
 * Express error middleware. Determines an appropriate HTTP status code and
 * message, logs the full error server-side (always, regardless of
 * environment — this is for OUR debugging, not the client's), and responds
 * with an environment-appropriate JSON body.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    // Determine status code: prefer an explicit status set on the error
    // object (e.g. by a controller doing `const e = new Error(...); e.status = 400; throw e;`),
    // fall back to the Supabase Postgrest error code mapping, else 500.
    const status = err.status || err.statusCode || 500;

    // Always log the full error server-side for observability, regardless of
    // what we send back to the client.
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, {
        message: err.message,
        status,
        stack: err.stack,
    });

    // Build the response body based on environment.
    const body = env.isProduction
        ? { error: status === 500 ? 'Internal server error' : err.message || 'Request failed' }
        : {
            error: err.message || 'Request failed',
            stack: err.stack,
            details: err.details || err.hint || undefined,
        };

    res.status(status).json(body);
}

/**
 * notFoundHandler(req, res)
 * Registered AFTER all valid routes but BEFORE errorHandler. Catches any
 * request that didn't match a defined route and returns a clean 404 JSON
 * response instead of Express's default HTML error page.
 */
export function notFoundHandler(req, res) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}
