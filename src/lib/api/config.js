/**
 * Feature-flag configuration for the Phase 2 backend integration.
 *
 * IMPORTANT: This flag defaults to OFF (false). The new backend
 * (`backend/`) is not deployed and the Phase 1 schema migrations
 * (`migrations/v2_normalized_schema/`) are not applied to the live
 * Supabase project yet. Do NOT flip this on in production until both
 * of those are true.
 *
 * Enable by setting in your .env file:
 *   VITE_USE_NEW_BACKEND=true
 *   VITE_BACKEND_BASE_URL=https://your-backend-host/api
 */

export const USE_NEW_BACKEND =
    String(import.meta.env.VITE_USE_NEW_BACKEND ?? '').toLowerCase() === 'true';

export const BACKEND_BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:4000/api';

// Timeout (ms) for calls to the new backend before giving up and
// falling back to mock data.
export const BACKEND_REQUEST_TIMEOUT_MS = 8000;
