// ============================================================================
// scripts/data-migration/apiClient.js
// ----------------------------------------------------------------------------
// Phase 4 — Thin authenticated HTTP client for the Phase 2 backend admin API.
//
// Uses Node's built-in global `fetch` (available in Node >=18, which the
// backend already requires). No external HTTP dependency.
//
// Flow:
//   1. `login(email, password)` POSTs to /auth/login. The backend proxies to
//      Supabase Auth (signInWithPassword) and returns `{ session, user }`.
//      We store `session.access_token` as the bearer token for all
//      subsequent calls.
//   2. `get/post/patch/delete` helpers attach `Authorization: Bearer <token>`
//      and JSON headers, then return the parsed JSON body (or null for 204).
//
// Configuration:
//   BACKEND_BASE_URL  — env var, default http://localhost:4000/api
//
// Error handling:
//   Non-2xx responses throw an `ApiError` carrying status + body so the
//   seeder's per-record try/catch can log a useful message and continue.
// ============================================================================

const DEFAULT_BASE_URL = 'http://localhost:4000/api';

let baseUrl = process.env.BACKEND_BASE_URL || DEFAULT_BASE_URL;
let accessToken = null;

/** Remove a trailing slash so we can safely join paths with `/`. */
function normalizeBase(url) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

baseUrl = normalizeBase(baseUrl);

export function setBaseUrl(url) {
    baseUrl = normalizeBase(url);
}

export function getBaseUrl() {
    return baseUrl;
}

export function getToken() {
    return accessToken;
}

/** Custom error preserving HTTP status + parsed body for clear logging. */
export class ApiError extends Error {
    constructor(status, body, path, method) {
        const msg =
            body && body.error
                ? `${method} ${path} -> ${status}: ${body.error}`
                : `${method} ${path} -> ${status}`;
        super(msg);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
        this.path = path;
        this.method = method;
    }
}

/**
 * Core request wrapper. Always sends JSON. Throws ApiError on non-2xx.
 * Returns parsed JSON, or null for 204 No Content.
 */
async function request(method, path, { body, query } = {}) {
    const url = new URL(`${baseUrl}${path}`);
    if (query && typeof query === 'object') {
        for (const [k, v] of Object.entries(query)) {
            if (v === undefined || v === null) continue;
            url.searchParams.set(k, String(v));
        }
    }

    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const parsed = isJson && res.status !== 204 ? await res.json() : null;

    if (!res.ok) {
        throw new ApiError(res.status, parsed, path, method);
    }
    return parsed;
}

export const get = (path, opts) => request('GET', path, opts);
export const post = (path, body, opts) => request('POST', path, { ...opts, body });
export const patch = (path, body, opts) => request('PATCH', path, { ...opts, body });
export const put = (path, body, opts) => request('PUT', path, { ...opts, body });
export const del = (path, opts) => request('DELETE', path, opts);

/**
 * Authenticate against the backend. Stores the access token internally.
 * Throws on failure (bad credentials, network error, etc.).
 *
 * Backend response shape (auth.controller.js login):
 *   { session: { access_token, refresh_token, expires_at, ... }, user: {...} }
 */
export async function login(email, password) {
    if (!email || !password) {
        throw new Error('login() requires both email and password.');
    }
    const res = await post('/auth/login', { email, password });
    // Tolerate either { session } or { data: { session } } shapes defensively.
    const session = res?.session ?? res?.data?.session;
    if (!session || !session.access_token) {
        throw new Error(
            `Login succeeded but no session.access_token in response. Raw: ${JSON.stringify(res).slice(0, 300)}`
        );
    }
    accessToken = session.access_token;
    return { session, user: res.user ?? res?.data?.user ?? null };
}

export function logout() {
    accessToken = null;
}
