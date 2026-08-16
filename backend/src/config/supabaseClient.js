// ============================================================================
// config/supabaseClient.js
// ----------------------------------------------------------------------------
// Exports TWO named Supabase JS clients. Which one you use in a given
// controller/middleware matters a great deal for security — read the notes
// below carefully before adding new usages.
//
// ── supabaseAnon ────────────────────────────────────────────────────────────
//   Built with SUPABASE_ANON_KEY. This client HONORS Row Level Security
//   (RLS) — every query it makes is subject to the RLS policies defined in
//   migrations/v2_normalized_schema/005_rls_policies.sql, exactly as if the
//   request came directly from a browser using the anon key.
//
//   Use supabaseAnon for:
//     - Verifying a bearer token via supabase.auth.getUser(token)
//       (middleware/auth.js) — this is the ONLY correct way to validate a
//       Supabase session JWT; never hand-roll JWT verification.
//     - POST /auth/login (sign-in) and POST /auth/logout (sign-out) proxying.
//     - Any public/user-context READ that should honor RLS (e.g. a future
//       public catalog endpoint that only returns is_active=TRUE rows,
//       enforced by the DB policy itself rather than app-level filtering).
//
// ── supabaseAdmin ───────────────────────────────────────────────────────────
//   Built with SUPABASE_SERVICE_ROLE_KEY. This client BYPASSES RLS entirely
//   — it has full read/write access to every table regardless of policy.
//
//   Use supabaseAdmin ONLY for:
//     - The requireAdmin middleware's own lookup of profiles.role (it must
//       bypass RLS to reliably read the caller's role row).
//     - All admin-authenticated CRUD writes (create/update/delete) in every
//       controller, but ONLY on routes that are mounted behind
//       `auth` + `requireAdmin` middleware. Never call supabaseAdmin from a
//       route that hasn't first confirmed the caller is a trusted admin —
//       doing so would defeat the entire purpose of RLS.
//     - Server-side storage uploads (POST /upload/image) since the storage
//       bucket write policy is admin-gated at the API layer, not via RLS.
//
//   NEVER send SUPABASE_SERVICE_ROLE_KEY (or any value derived from the
//   supabaseAdmin client's internals) to the client in a response body.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * supabaseAnon
 * RLS-respecting client for auth verification and public/user-context reads.
 * `autoRefreshToken`/`persistSession` are disabled because this is a
 * stateless server process — each request supplies its own bearer token, so
 * there is no long-lived browser session to persist or refresh.
 */
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * supabaseAdmin
 * Service-role client that bypasses RLS. Use ONLY after requireAdmin has
 * verified the caller, or for the requireAdmin role lookup itself.
 */
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
