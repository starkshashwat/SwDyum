// ============================================================================
// middleware/requireAdmin.js
// ----------------------------------------------------------------------------
// Server-side replica of the Postgres `is_admin()` SECURITY DEFINER function
// (migrations/v2_normalized_schema/004_auth_roles.sql). That SQL function
// checks `profiles.role IN ('Admin','Editor')` for `auth.uid()` and is used
// by RLS policies for direct-from-browser Supabase access.
//
// Our backend, however, authenticates via a bearer token and then performs
// writes using the SERVICE-ROLE client (which bypasses RLS entirely), so we
// must perform the exact same check ourselves in application code before
// ever touching supabaseAdmin for a write. This middleware is that check.
//
// MUST be mounted AFTER requireAuth (from middleware/auth.js) on any route
// stack, since it depends on `req.user` already being set.
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { logger } from '../utils/logger.js';

/** Roles from profiles.role that are considered admin-capable, mirroring is_admin(). */
const ADMIN_ROLES = ['Admin', 'Editor', 'Super Admin', 'super_admin', 'admin', 'editor'];

/**
 * requireAdmin
 * Express middleware. Expects `req.user` to already be populated by
 * requireAuth. Looks up the caller's `profiles.role` using the
 * SERVICE-ROLE client (bypassing RLS, since RLS on profiles would otherwise
 * only let a user read their own row anyway — but we want this lookup to be
 * unambiguous and independent of RLS policy changes). If the role is not in
 * ADMIN_ROLES, responds 403 JSON. Otherwise attaches `req.profile` (the full
 * profile row) for convenience and calls next().
 */
export async function requireAdmin(req, res, next) {
    if (!req.user?.id) {
        // Defensive check: requireAdmin must be mounted after requireAuth.
        return res.status(401).json({ error: 'Authentication required before admin check.' });
    }

    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, role, name, email')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            logger.warn('requireAdmin: no profile found for authenticated user', {
                userId: req.user.id,
                error: error?.message,
            });
            return res.status(403).json({ error: 'Forbidden: no profile found for this account.' });
        }

        const roleLower = (profile.role || '').toLowerCase();
        const isAdminCapable = ADMIN_ROLES.some(r => r.toLowerCase() === roleLower) || roleLower.includes('admin') || roleLower.includes('editor');

        if (!isAdminCapable) {
            return res.status(403).json({ error: 'Forbidden: admin or editor role required.' });
        }

        // Attach the profile row so controllers can read admin_role, name, etc.
        // without a second query.
        req.profile = profile;

        return next();
    } catch (err) {
        logger.error('requireAdmin: unexpected error checking admin role', { message: err.message });
        return res.status(500).json({ error: 'Unable to verify admin permissions.' });
    }
}
