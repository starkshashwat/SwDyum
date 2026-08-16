// ============================================================================
// utils/logger.js
// ----------------------------------------------------------------------------
// Minimal, dependency-free structured logger used across the backend. Keeps
// log output consistent (level, timestamp, message, optional metadata) and
// gives us a single place to later swap in a more sophisticated logger
// (e.g. pino/winston) without touching every call site.
//
// Request/response access logging is handled separately by `morgan` in
// server.js — this logger is for application-level events (startup,
// warnings, caught errors, etc.).
// ============================================================================

/**
 * Formats and prints a log line to the appropriate console stream.
 * @param {'info'|'warn'|'error'} level
 * @param {string} message
 * @param {object} [meta] - optional structured metadata to append as JSON.
 */
function log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    const output = meta !== undefined ? `${line} ${JSON.stringify(meta)}` : line;

    if (level === 'error') {
        console.error(output);
    } else if (level === 'warn') {
        console.warn(output);
    } else {
        console.log(output);
    }
}

/** logger.info(message, meta?) — general informational events (e.g. server started). */
const info = (message, meta) => log('info', message, meta);

/** logger.warn(message, meta?) — recoverable/unexpected conditions worth flagging. */
const warn = (message, meta) => log('warn', message, meta);

/** logger.error(message, meta?) — caught errors, failed requests, startup failures. */
const error = (message, meta) => log('error', message, meta);

export const logger = { info, warn, error };
