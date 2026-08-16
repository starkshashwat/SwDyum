# Swadyum Website

Multi-surface D2C e-commerce platform for premium Bihari pickles.

## Surfaces

| App | Path | Stack |
| --- | --- | --- |
| Storefront (customer SPA) | repo root (`src/`, `index.html`) | React 19 + Vite + custom CSS (+ Tailwind v4 in `src/components/pdp`) |
| Admin panel | `admin/` | React 19 + Vite + Tailwind v4 + React Router v7 |
| Express API | `backend/` | Node ESM, Express 4, Zod, Supabase (anon + service-role) |
| Edge functions | `supabase/functions/` | Deno (razorpay, whatsapp-auth/webhook/templates, send-whatsapp-message, cleanup-pending-checkouts, delete-account) |
| Database | `migrations/v2_normalized_schema/` (+ `supabase/migrations/` for `supabase db push`) | PostgreSQL (Supabase), RLS everywhere |

## Development

- Storefront: `npm run dev` (Vite, port 8443)
- Admin: `cd admin && npm run dev` (reads `VITE_API_BASE_URL`, defaults to `http://localhost:4000/api`)
- Backend: `cd backend && npm run dev` (node --watch, port 4000; needs `backend/.env` with Supabase keys)

## Key rules

- **Prices are server-side only.** The `razorpay` edge function recomputes
  totals from the DB; the client sends items, never amounts.
- **Order/payment status transitions happen only server-side** (edge
  function webhook/verify or the backend service-role client). Customers are
  read-only on `orders`/`payments`/`invoices` via RLS (migration 020).
- Admin pages should use `admin/src/lib/apiClient.js` (Bearer auth), not
  direct Supabase calls; some pages still query Supabase directly pending
  migration.
- Migrations 001–023 apply linearly to a fresh Supabase project; the live
  schema is the source of truth for column names.
- Webhook security: Razorpay (HMAC signature), Velocity (unguessable URL
  token — `VELOCITY_WEBHOOK_SECRET` in `backend/.env`), Meta WhatsApp
  (`X-Hub-Signature-256` via `WHATSAPP_APP_SECRET` edge env var).
