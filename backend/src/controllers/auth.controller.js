// ============================================================================
// controllers/auth.controller.js
// ----------------------------------------------------------------------------
// Thin proxy around Supabase Auth for login/session/logout. We deliberately
// do NOT implement our own password hashing/session/JWT logic — Supabase
// Auth already handles this correctly and securely; we just expose a
// convenient REST surface over it for the admin panel (and, later, the
// public frontend) to call.
// ============================================================================

import { supabaseAnon, supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /auth/login
 * Proxies to Supabase Auth's signInWithPassword using the ANON client
 * (this is the correct client for this operation — sign-in is a public,
 * unauthenticated-until-verified operation and must never use the
 * service-role key). Returns the Supabase session (access_token,
 * refresh_token, expires_at, user) on success.
 *
 * Rate-limited by authLoginLimiter (see middleware/rateLimiter.js) at the
 * route level to slow down credential-stuffing attempts.
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

    if (error) {
        // Supabase returns a generic "Invalid login credentials" message for
        // wrong email/password — we pass that through as-is (401) rather than
        // leaking whether the email exists (which would aid enumeration attacks).
        return res.status(401).json({ error: error.message || 'Invalid login credentials.' });
    }

    res.json({
        session: data.session,
        user: data.user,
    });
});

/**
 * GET /auth/session
 * Requires a valid bearer token (mounted behind requireAuth). Returns the
 * verified user object plus their admin role info (looked up via the
 * service-role client, same as requireAdmin does) so the frontend/admin
 * panel can decide what UI to show without a second round-trip.
 */
export const getSession = asyncHandler(async (req, res) => {
    // req.user is already populated & verified by requireAuth middleware.
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, role')
        .eq('id', req.user.id)
        .single();

    if (error || !profile) {
        // Authenticated but no profile row yet (e.g. trigger hasn't run) — still
        // return the auth user, just without role info.
        return res.json({ user: req.user, profile: null });
    }

    res.json({ user: req.user, profile });
});

/**
 * POST /auth/logout
 * Mostly a client-side concern (discard the token), but we proxy
 * supabase.auth.signOut() for completeness / to revoke the refresh token
 * server-side where supported. Optional — the frontend should also discard
 * its local copy of the token regardless of this call's outcome.
 */
export const logout = asyncHandler(async (req, res) => {
    const { error } = await supabaseAnon.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully.' });
});
