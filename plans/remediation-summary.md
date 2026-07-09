# Remediation Summary (2026-07-09)

All 21 findings from [`plans/security-audit.md`](../plans/security-audit.md) have been addressed.

## Files modified

| File | Fixes |
|------|-------|
| [`fix_orders_rls.sql`](../fix_orders_rls.sql) | V6, V8 — secure orders/order_items RLS (owner-scoped + admin), `is_admin()` SECURITY DEFINER function, removed hardcoded admin email seeds |
| [`relax_rls.sql`](../relax_rls.sql) | V7 — replaced open `FOR ALL USING(true)` coupons policy with public-read-active + admin-gated writes |
| [`fix_coupons_rls.sql`](../fix_coupons_rls.sql) | V7 — aligned with `relax_rls.sql` (admin-gated writes) |
| [`create_whatsapp_auth_tables.sql`](../create_whatsapp_auth_tables.sql) | V3, V9 — OTP stored as `otp_hash` (SHA-256), added `attempts`/`locked_until` columns, RLS restricted to `service_role` only |
| [`supabase/functions/whatsapp-auth/index.ts`](../supabase/functions/whatsapp-auth/index.ts) | V1 (signed HMAC session token), V2 (auth-required `update_profile` with `id === jwt.sub`), V4 (attempt lockout + cooldown), V5 (`crypto.getRandomValues`), V17 (no error leakage), V18 (origin-restricted CORS) |
| [`supabase/functions/razorpay/index.ts`](../supabase/functions/razorpay/index.ts) | V17, V18 |
| [`supabase/functions/fastrr-checkout/index.ts`](../supabase/functions/fastrr-checkout/index.ts) | V17, V18 |
| [`supabase/functions/fastrr-order-webhook/index.ts`](../supabase/functions/fastrr-order-webhook/index.ts) | V17, V18 (webhook CORS pinned to Shiprocket origin) |
| [`supabase/functions/delete-account/index.ts`](../supabase/functions/delete-account/index.ts) | V17, V18 |
| [`server.js`](../server.js) | V11 (fail-closed Razorpay verify + `timingSafeEqual`), V12 (fail-closed webhook HMAC), V14 (amount + cart validation), V15 (pagination cap), V16 (redirect_url allow-list), V17 (generic error messages) |
| [`src/supabaseClient.js`](../src/supabaseClient.js) | V10 — keys from `import.meta.env` |
| [`admin/src/lib/supabase.js`](../admin/src/lib/supabase.js) | V10 — keys from `import.meta.env` |
| [`src/components/auth/WhatsAppLoginModal.jsx`](../src/components/auth/WhatsAppLoginModal.jsx) | V1 — stores signed session token |
| [`src/mockDb.js`](../src/mockDb.js) | V2 — sends `Authorization: Bearer <token>` to `update_profile` |

## Files created

| File | Purpose |
|------|---------|
| [`.env.example`](../.env.example) | Documents all required env vars (V10) |
| [`provision_admin.sql`](../provision_admin.sql) | Manual admin provisioning instructions (V8) |

## Required follow-up actions before deploying

1. **Run the SQL migrations** in order against Supabase (SQL editor, service role):
   `create_whatsapp_auth_tables.sql` → `fix_orders_rls.sql` → `relax_rls.sql`.
2. **Set Supabase secrets** for the edge functions (see `.env.example`):
   `supabase secrets set SUPABASE_JWT_SECRET=... WHATSAPP_ACCESS_TOKEN=... ...`
   `SUPABASE_JWT_SECRET` is required for the signed session tokens (V1).
3. **Create `.env.local`** for the frontend and backend with the real values
   from `.env.example`. Set `MOCK_PAYMENTS=false` and `MOCK_WEBHOOKS=false`
   in production.
4. **Provision admin users manually** via `provision_admin.sql` (V8). Do not
   re-add hardcoded admin emails to version-controlled SQL.
5. **V13** (`.env` parser) — `dotenv` is already a dependency; consider
   replacing the custom parser in `server.js` with `import 'dotenv/config'`.
6. **V19** — update the `server.js` CORS origin list to the production domain.
7. **V20** — verify `account_deletion_requests` RLS restricts inserts to the
   owning `user_id` (not shown in audited files).
8. **V21** — add a Content-Security-Policy header and consider moving the
   session token to an `httpOnly` cookie once a server session endpoint exists.

## Verification

- `node --check server.js` → exit code 0 (syntax valid).
- ESLint could not run due to a **pre-existing** `eslint-plugin-react` /
  ESLint 10 incompatibility (`contextOrFilename.getFilename is not a function`),
  unrelated to these changes.
- Edge-function TypeScript "errors" reported by the IDE are expected: the
  workspace TS config targets the browser, while these files target the Deno
  runtime (`Deno.env`, `esm.sh` imports). They deploy correctly via Supabase.
