// ============================================================================
// lib/apiClient.js
// ----------------------------------------------------------------------------
// Centralized HTTP client for talking to the Phase 2 Express backend
// (see backend/README.md for the full route reference). Every admin page
// MUST use this client instead of calling Supabase directly — the backend
// is the single source of truth for validation, RBAC, and business rules.
//
// Responsibilities:
//   - Reads the API base URL from VITE_API_BASE_URL (falls back to
//     http://localhost:4000/api for local development).
//   - Persists the Supabase session (access_token/refresh_token/expires_at)
//     returned by POST /auth/login in sessionStorage, and attaches
//     `Authorization: Bearer <access_token>` to every subsequent request.
//   - Normalizes error handling: any non-2xx response throws an ApiError
//     with the backend's `error` message and (if present) zod `details`
//     from the validate() middleware, so calling code can display the
//     exact backend validation message instead of a generic one.
//   - On a 401 response (expired/invalid token) it clears the stored
//     session and redirects to /login, since the backend is the source of
//     truth for whether a token is still valid.
//   - Supports plain JSON bodies as well as multipart/form-data (for the
//     image upload endpoint) via the `upload()` helper.
//
// Phase 5 security hardening — token storage tradeoff (item 7):
//   Previously the session was stored in `localStorage`, which persists
//   indefinitely across browser restarts and is readable by ANY script
//   running on the page (i.e. an XSS payload has an unbounded window to
//   exfiltrate the admin bearer token). We audited admin/*.md and found no
//   documented "stay logged in across browser restarts" requirement for the
//   admin panel, so we switched to `sessionStorage`, which:
//     - Still survives page refreshes/reloads within the same tab (so the
//       verifySession() flow on mount continues to work exactly as before).
//     - Is automatically cleared when the tab/browser is closed, shrinking
//       the XSS exfiltration/replay window to the current tab session
//       instead of "forever until manual logout".
//     - Is NOT shared across tabs, so a compromised/shared machine doesn't
//       leave a still-valid admin session sitting in a new tab.
//   If a future requirement needs persistent multi-tab "remember me" login,
//   revisit this decision explicitly (e.g. httpOnly cookie set by the
//   backend would be the stronger fix, since it wouldn't be readable by
//   client-side JS at all).
// ============================================================================

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
    console.error(
        '[apiClient] VITE_API_BASE_URL is not set in the production build — ' +
        'every request will target localhost. Configure it in the Vercel project env.'
    );
}

const SESSION_STORAGE_KEY = 'swadyum_admin_session';

/** Custom error type carrying the backend's status code + validation details. */
export class ApiError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details; // zod .flatten() shape from validate() middleware, if any
    }
}

/** Reads the persisted session object ({access_token, refresh_token, expires_at, user}) or null. */
export function getStoredSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** Persists the session returned by POST /auth/login. */
export function storeSession(session) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

/** Clears the persisted session (used on logout / 401). */
export function clearStoredSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function getAccessToken() {
    return getStoredSession()?.access_token || null;
}

// ── Refresh-on-401 ───────────────────────────────────────────────────────────
// AuthContext registers a handler that refreshes the Supabase session and
// re-stores it. On a 401 the request is retried once with the fresh token
// instead of hard-redirecting to /login (which used to log admins out every
// hour when the access token expired despite a valid refresh token).
let sessionRefreshHandler = null;
let refreshInFlight = null;

export function setSessionRefreshHandler(fn) {
    sessionRefreshHandler = typeof fn === 'function' ? fn : null;
}

async function tryRefreshSession() {
    if (!sessionRefreshHandler) return false;
    // Coalesce concurrent 401s into a single refresh call
    if (!refreshInFlight) {
        refreshInFlight = Promise.resolve(sessionRefreshHandler())
            .catch(() => false)
            .finally(() => { refreshInFlight = null; });
    }
    return refreshInFlight;
}

/**
 * Builds a query string from a plain object, skipping undefined/null/''
 * values so callers can pass optional filters without manual cleanup.
 */
function buildQueryString(params) {
    if (!params) return '';
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        usp.append(key, value);
    });
    const qs = usp.toString();
    return qs ? `?${qs}` : '';
}

/**
 * Low-level request function used by all the verb helpers below.
 * @param {string} method HTTP method
 * @param {string} path route path starting with '/' (e.g. '/categories')
 * @param {object} [options]
 * @param {object} [options.body] JSON-serializable body (ignored for GET/DELETE)
 * @param {object} [options.params] query params object
 * @param {FormData} [options.formData] multipart body — takes precedence over body
 */
async function request(method, path, { body, params, formData, _isRetry } = {}) {
    const url = `${API_BASE_URL}${path}${buildQueryString(params)}`;
    const token = getAccessToken();

    const headers = {};
    if (!formData) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (networkErr) {
        throw new ApiError(
            'Could not reach the backend API. Check VITE_API_BASE_URL and that the server is running.',
            0,
            null
        );
    }

    // Attempt to parse JSON regardless of status (backend always returns JSON,
    // even for errors — see errorHandler.js).
    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (response.status === 401 && !_isRetry) {
        // Access token likely expired — try one silent refresh and retry.
        const refreshed = await tryRefreshSession();
        if (refreshed) {
            return request(method, path, { body, params, formData, _isRetry: true });
        }
    }

    if (response.status === 401) {
        // Refresh failed or token truly invalid — the backend is the source
        // of truth here. Clear the stale session and force a re-login.
        clearStoredSession();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        throw new ApiError(payload?.error || 'Session expired. Please log in again.', 401, null);
    }

    if (!response.ok) {
        const message = payload?.error || `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status, payload?.details || null);
    }

    return payload;
}

/**
 * The shared API client. All admin pages should import `apiClient` and call
 * these methods instead of using `fetch`/Supabase directly.
 */
export const apiClient = {
    get: (path, params) => request('GET', path, { params }),
    post: (path, body) => request('POST', path, { body }),
    put: (path, body) => request('PUT', path, { body }),
    patch: (path, body) => request('PATCH', path, { body }),
    delete: (path) => request('DELETE', path),
    /** Multipart upload helper — pass a FormData instance. */
    upload: (path, formData) => request('POST', path, { formData }),
};

export { API_BASE_URL };
