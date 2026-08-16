// ============================================================================
// config/env.js
// ----------------------------------------------------------------------------
// Loads environment variables (via dotenv) and validates that every variable
// REQUIRED for the backend to function safely is present at boot time.
//
// Rationale: failing fast with a clear error message at startup is far
// preferable to letting a misconfigured server run and produce confusing
// runtime errors (e.g. "Cannot read properties of undefined") deep inside a
// request handler, or — worse — silently falling back to an insecure
// default (like skipping the admin check because the service-role client
// couldn't be built).
// ============================================================================

import dotenv from 'dotenv';

// Load `.env` (or `.env.local` if present) from the backend/ root. dotenv
// does not throw if the file is missing — it simply leaves process.env as-is
// (useful in environments where env vars are injected by the host platform
// instead of a file, e.g. Render/Railway/Fly).
dotenv.config();

/**
 * List of environment variables that MUST be set for the backend to start.
 * These are the Supabase credentials used by config/supabaseClient.js — if
 * any are missing, every route in the app would fail at request-time in
 * confusing ways, so we check upfront instead.
 */
const REQUIRED_ENV_VARS = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
];

/**
 * validateEnv()
 * Checks that all REQUIRED_ENV_VARS are present and non-empty. If any are
 * missing, logs a clear error message listing exactly which vars are absent
 * and exits the process with a non-zero code (fail fast, don't limp along).
 *
 * Call this once, as early as possible, in server.js before anything else
 * (route registration, Supabase client creation, etc.) happens.
 */
export function validateEnv() {
    const missing = REQUIRED_ENV_VARS.filter((key) => {
        const value = process.env[key];
        return !value || value.trim() === '';
    });

    if (missing.length > 0) {
        // Use console.error (not the app logger) since the logger itself may
        // depend on env being valid, and we want this message to always surface.
        console.error(
            '\n❌ FATAL: Missing required environment variable(s):\n' +
            missing.map((key) => `   - ${key}`).join('\n') +
            '\n\nCreate a `.env` file in backend/ (see .env.example) or set these ' +
            'variables in your process environment before starting the server.\n'
        );
        process.exit(1);
    }
}

/**
 * env — a single typed/normalized object exposing every config value the
 * rest of the app needs, with sensible defaults for optional settings. This
 * keeps `process.env.X` string-soup out of the rest of the codebase.
 */
export const env = {
    // Node environment. Controls error verbosity in errorHandler.js.
    NODE_ENV: process.env.NODE_ENV || 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production',

    // Server
    PORT: Number(process.env.PORT) || 4000,

    // Supabase (required — validated by validateEnv() above)
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

    // CORS allow-list — comma-separated string -> array, trimmed, empties removed.
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),

    // Supabase Storage bucket for product image uploads.
    STORAGE_BUCKET_PRODUCT_IMAGES:
        process.env.STORAGE_BUCKET_PRODUCT_IMAGES || 'product-images',

    // Rate limiting configuration (see middleware/rateLimiter.js for usage).
    RATE_LIMIT_WINDOW_MIN: Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15,
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
    AUTH_RATE_LIMIT_WINDOW_MIN: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MIN) || 15,
    AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,

    // Velocity Shipping config
    VELOCITY_BASE_URL: process.env.VELOCITY_BASE_URL || 'https://shazam.velocity.in',
    VELOCITY_WEBHOOK_URL: process.env.VELOCITY_WEBHOOK_URL,
    VELOCITY_WEBHOOK_SECRET: process.env.VELOCITY_WEBHOOK_SECRET,
    CREDENTIAL_ENCRYPTION_KEY: process.env.CREDENTIAL_ENCRYPTION_KEY,
    SHIPPING_SYNC_INTERVAL_MS: Number(process.env.SHIPPING_SYNC_INTERVAL_MS) || 900000,
};
