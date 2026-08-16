# Production Deployment Guide — Swadyum (Mango Pickle Boutique)

This guide walks an operator from an empty Supabase project to a live,
production-grade deployment of the Swadyum storefront, admin panel, and
backend API. Every command, port, and environment variable below is
grounded in the actual files in this repository — nothing is invented.

The deployment is split across four independently deployable surfaces,
plus the Supabase project that backs them:

| Surface | Code location | Stack | Recommended host |
|---|---|---|---|
| Storefront (customer-facing SPA) | `src/` | Vite + React 19 + Tailwind v4 | Vercel |
| Admin panel (internal SPA) | `admin/` | Vite + React 19 + Tailwind v4 | Vercel |
| Backend API (admin/catalog/commerce) | `backend/` | Express 4 + Supabase JS v2 | Render |
| Legacy proxy server (checkout, Shiprocket, Razorpay, Fastrr) | root `server.js` | Express 5 | Render |
| Database / Auth / Storage / Edge Functions | `supabase/` | Supabase (managed Postgres) | Supabase Cloud |

> **Note on the legacy proxy.** The root `server.js` (started via
> `npm run server` from `package.json`) is the *original* Express server
> that still owns the public customer-facing checkout, Shiprocket,
> Razorpay, and Fastrr routes. The new `backend/` API is authored
> independently and does **not** modify or replace it. Both run in
> production side-by-side until a later phase deprecates `server.js`.
> This guide keeps `server.js` running as-is.

---

## 1. Overview

### 1.1 Architecture diagram

```mermaid
flowchart TB
    subgraph Clients
        A[Storefront SPA<br/>src/]
        C[Admin SPA<br/>admin/]
    end

    subgraph Hosting
        B[Vercel<br/>storefront]
        D[Vercel<br/>admin]
        E[Render<br/>backend/ API :4000]
        F[Render<br/>root server.js :3001]
    end

    subgraph Supabase["Supabase Cloud"]
        DB[(Postgres<br/>+ RLS)]
        AUTH[Auth]
        ST[Storage]
        EF[Edge Functions<br/>9 functions]
    end

    subgraph ThirdParty["Third-party gateways"]
        RZ[Razorpay]
        SR[Shiprocket / Fastrr]
        WA[WhatsApp Cloud API]
    end

    A --> B
    C --> D
    B --> E
    D --> E
    B --> F
    E --> DB
    E --> AUTH
    E --> ST
    F --> DB
    F --> SR
    F --> RZ
    EF --> DB
    EF --> WA
    RZ -.webhook.-> F
    SR -.webhook.-> EF
```

### 1.2 Data-flow summary

- The **storefront** (`src/`) reads catalog data from the new `backend/`
  API **only when** the feature flag `VITE_USE_NEW_BACKEND=true` is set
  at build time. When the flag is off (the default/safe state), it falls
  back to the existing mock/Supabase-direct data sources and behaves
  exactly as it does today. Every backend read that fails for any reason
  (network, non-2xx, unexpected shape) automatically falls back to mock
  data — the page never breaks. See `src/.env.example` and
  `src/lib/api/config.js`.
- The **admin panel** (`admin/`) talks **only** to the `backend/` API via
  `VITE_API_BASE_URL`. It never calls Supabase directly for writes. (A
  read-only Supabase anon client still exists in
  `admin/src/lib/supabase.js` as a fallback; see §11 for the follow-up
  note.)
- The **backend API** (`backend/`) is an Express app on port `4000`
  (default). It uses two Supabase clients: `supabaseAnon` (RLS-respecting,
  for auth verification and public reads) and `supabaseAdmin`
  (service-role, RLS-bypassing, used only after `requireAdmin` has
  verified the caller is an Admin/Editor). All mutating endpoints are
  guarded by `requireAuth` + `requireAdmin` and validated with Zod.
- The **legacy proxy** (`server.js`, port `3001` via `PROXY_PORT`)
  continues to own checkout, Shiprocket, Razorpay, and Fastrr routes.
- **Supabase Edge Functions** (`supabase/functions/*`) handle WhatsApp
  auth/messaging, Fastrr checkout + order webhooks, Razorpay, Shiprocket
  sync, account deletion, and pending-checkout cleanup. They remain in
  place and were hardened in Phase 5 (see §11).

### 1.3 Deployment order

The surfaces have a hard dependency order. Deploy strictly in this
sequence:

1. **Database** — apply the Phase 1 schema migrations to Supabase (§3).
2. **Backend API** — deploy `backend/` and verify it boots and answers
   health checks (§4).
3. **Seed data** — run `scripts/data-migration/seed.js` against the live
   backend (§5).
4. **Admin panel** — deploy `admin/`, log in, verify seeded data is
   visible (§6).
5. **Storefront** — deploy `src/` with `VITE_USE_NEW_BACKEND=false`
   first (no behavior change), then flip the flag on after verification
   (§7).

---

## 2. Prerequisites

### 2.1 Accounts and tools

| Need | Why |
|---|---|
| Supabase project (Cloud or self-hosted) | Postgres + Auth + Storage + Edge Functions |
| Vercel account (or equivalent static host) | Host the two SPAs |
| Render account (recommended) — or Railway / Fly.io | Host `backend/` and root `server.js` as two Node services |
| Razorpay account (live keys) | Payments (only if going live with real payments) |
| Shiprocket account | Shipping |
| Fastrr account | Shiprocket Checkout integration |
| WhatsApp Cloud API (Meta) account | WhatsApp OTP / messaging |
| Node.js **>= 18** | Required by `backend/package.json` and `scripts/data-migration/package.json` `engines` fields; also needed for local builds |
| `supabase` CLI (optional) | For applying migrations and setting edge-function secrets from the terminal |
| `vercel` CLI (optional) | For deploying the SPAs from the terminal |

### 2.2 Package managers per subproject

The repo currently mixes lockfiles. Use the package manager that matches
the committed lockfile in each subproject to avoid drift:

| Subproject | Committed lockfile | Use |
|---|---|---|
| Root (`/`) | `package-lock.json` **and** `pnpm-lock.yaml` (both present) | Prefer **npm** for consistency with the other subprojects; remove `pnpm-lock.yaml` in a follow-up cleanup to avoid ambiguity (see §11) |
| `admin/` | `package-lock.json` | **npm** |
| `backend/` | *(no lockfile committed)* | **npm** — run `npm install` to generate `package-lock.json` and commit it |
| `scripts/data-migration/` | `package-lock.json` | **npm** |

### 2.3 Node version

All Node services require **Node.js >= 18** (per the `engines` fields in
`backend/package.json` and `scripts/data-migration/package.json`). The
root and admin Vite builds also work on Node 18+. Pin Node 18 or 20 on
your hosting platform.

### 2.4 Hosting recommendation

- **Backend API (`backend/`)** → **Render** Web Service. It is a
  long-running Node process (`node src/server.js`), needs a stable port
  (Render injects `PORT`), and benefits from Render's built-in env-var
  management and health checks. Alternatives: Railway, Fly.io.
- **Root `server.js`** → a **separate** Render Web Service (it listens
  on `PROXY_PORT`, default `3001`, and must not share a process with the
  new backend).
- **Storefront and Admin SPAs** → **Vercel** static hosting with the
  existing `vercel.json` SPA rewrite (see §6, §7). Alternatives: Netlify,
  Cloudflare Pages.

---

## 3. Database Setup

The canonical schema lives in
[`migrations/v2_normalized_schema/`](migrations/v2_normalized_schema/).
It reconciles the many conflicting, ad-hoc SQL files that accumulated in
the project root into a single, idempotent, reviewed set of DDL. See
[`migrations/v2_normalized_schema/README.md`](migrations/v2_normalized_schema/README.md)
for the full rationale.

### 3.1 Run order

Run the six files in strict numeric order. Each file is wrapped in
`BEGIN; ... COMMIT;` and is idempotent (`CREATE TABLE IF NOT EXISTS`,
`CREATE INDEX IF NOT EXISTS`, `DROP POLICY IF EXISTS` before
`CREATE POLICY`, `CREATE OR REPLACE` for functions/views), so re-running
a file is safe.

| # | File | Tables / Objects |
|---|------|------------------|
| 1 | `001_categories_products.sql` | `categories`, `category_pairings`, `products`, `product_variants`, `product_images`, `product_ingredients` |
| 2 | `002_content_entities.sql` | `product_trust_badges`, `product_faqs`, `product_process_steps`, `combos`, `combo_items`, `deals`, `announcements`, `offers` |
| 3 | `003_commerce.sql` | `orders`, `order_items`, `payments`, `coupons`, `coupon_usage`, `product_reviews` + `reviews` compatibility VIEW |
| 4 | `004_auth_roles.sql` | `profiles`, `admin_roles`, `admin_user_roles`, `addresses`, `subscriptions`, `invoices`, `inventory_logs`, `blogs`, `newsletter_subscribers`, `seo_metadata`, `whatsapp_messages`, `whatsapp_otps`, `account_deletion_requests`, `is_admin()` function |
| 5 | `005_rls_policies.sql` | RLS enable + policies for every table in files 1–4 |
| 6 | `006_indexes_triggers.sql` | Indexes + `set_updated_at()` trigger function + `BEFORE UPDATE` triggers on all tables with `updated_at` |

> **Dependency note:** File 3 (`orders`) depends on `profiles` from file
> 4. Run file 4 before file 3 if you split the set across separate
> transactions, or run the whole set in one transaction. Ensure
> `profiles` exists before `orders`/`coupon_usage`/`invoices`/
> `subscriptions` foreign keys resolve.

### 3.2 How to apply

**Option A — Supabase SQL Editor (simplest):**

1. Open your Supabase project → SQL Editor.
2. Paste each file's contents in numeric order (001 → 006) and run.
3. Confirm each run reports success with no errors.

**Option B — `supabase` CLI:**

```bash
# from the repo root
supabase db push --db-url "postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

Or pipe each file through `psql` / the CLI in order:

```bash
for f in 001_categories_products 002_content_entities 003_commerce 004_auth_roles 005_rls_policies 006_indexes_triggers; do
  supabase db execute --file "migrations/v2_normalized_schema/$f.sql"
done
```

### 3.3 Post-migration steps

After the six files are applied, run these two infrastructure-config
files (they are **not** schema and are intentionally not part of the
migration set):

1. [`enable_realtime_for_catalog.sql`](enable_realtime_for_catalog.sql) —
   re-enables Realtime on the catalog tables. Re-run **only after** the
   new schema is applied.
2. [`review_storage_setup.sql`](review_storage_setup.sql) — configures
   the Storage bucket + policies for review images. Re-run as needed.

### 3.4 Superseded legacy SQL files — DO NOT re-run

Once the new migration set is applied, the following legacy files are
**superseded** and must **not** be re-run. Re-running them may
re-introduce conflicting table shapes, duplicate policies, or dropped
columns. They are intentionally **not deleted** here — only documented
as superseded.

**Project root (superseded):**

| Legacy file | Superseded by |
|---|---|
| `complete_schema.sql` | 001 + 002 + 003 + 004 |
| `supabase_schema.sql` | 001 + 003 + 004 |
| `create_orders_tables.sql` | 003 |
| `create_coupons_table.sql` | 003 |
| `create_whatsapp_auth_tables.sql` | 004 |
| `create_whatsapp_messages_table.sql` | 004 |
| `create_account_deletion_table.sql` | 004 |
| `provision_admin.sql` | 004 |
| `relax_rls.sql` | 005 — **do NOT relax RLS** |
| `fix_auth_trigger.sql` | 004 (the auth-trigger itself may still be needed — verify after applying) |
| `fix_coupons_rls.sql` | 005 |
| `fix_foreign_key.sql` | 003 |
| `fix_orders_rls.sql` | 005 |

**`migrations/` folder (superseded):**

| Legacy file | Superseded by |
|---|---|
| `migrations/add_checkout_tracking_columns.sql` | 003 |
| `migrations/create_payments_table.sql` | 003 |

**Seed files (data, not schema) — re-run only after column reconciliation:**

| File | Note |
|---|---|
| `seed.sql` | Re-run only after reconciling column names with the canonical schema |
| `seed_orders.sql` | Re-run only after reconciling column names with canonical `orders` |
| `seed_reviews.sql` | Re-run only against `product_reviews` (canonical name), not `reviews` |

> The recommended path for catalog data is the API seeder in §5, not
> these raw SQL seed files. The SQL seed files are kept for reference and
> manual recovery only.

### 3.5 Provision the first admin user

The backend's `requireAdmin` middleware checks `profiles.role IN
('Admin','Editor')`. Before you can seed data or log in to the admin
panel, you need at least one Supabase Auth user whose `profiles.role` is
`'Admin'` or `'Editor'`.

1. In Supabase → Authentication → Users → **Add user**, create a user
   with email + password.
2. Insert/confirm their `profiles` row with `role = 'Admin'`:

   ```sql
   -- run in Supabase SQL Editor
   insert into profiles (id, email, role)
   select auth.users.id, auth.users.email, 'Admin'
   from auth.users
   where auth.users.email = 'admin@swadyum.store'
   on conflict (id) do update set role = 'Admin';
   ```

   (Adjust the column list to match your `profiles` shape from
   `004_auth_roles.sql`.)

3. Use these credentials as `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
   in §5 and to log in to the admin panel in §6.

---

## 4. Backend API Deployment (`backend/`)

### 4.1 Environment variables

Copy [`backend/.env.example`](backend/.env.example) to `.env` (or inject
them via your host's env-var UI). The backend validates required vars at
boot via [`backend/src/config/env.js`](backend/src/config/env.js) and
exits non-zero if any required var is missing.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | — | Supabase project URL (same as root `VITE_SUPABASE_URL`) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | — | Service-role key (bypasses RLS). Server-side only — **never** expose to any client or return in a response |
| `SUPABASE_ANON_KEY` | ✅ | — | Anon/public key (RLS-respecting). Used for token verification and public reads |
| `PORT` | — | `4000` | HTTP port the API listens on |
| `NODE_ENV` | — | `development` | Set to `production` to hide stack traces / raw DB errors in responses |
| `ALLOWED_ORIGINS` | — | *(empty = allow non-browser callers)* | Comma-separated CORS allow-list. **Never use `*`.** e.g. `https://swadyum.store,https://admin.swadyum.store` |
| `STORAGE_BUCKET_PRODUCT_IMAGES` | — | `product-images` | Supabase Storage bucket used by `POST /api/upload/image` |
| `RATE_LIMIT_WINDOW_MIN` | — | `15` | Global rate limiter window (minutes) |
| `RATE_LIMIT_MAX` | — | `100` | Global rate limiter max requests/window/IP |
| `AUTH_RATE_LIMIT_WINDOW_MIN` | — | `15` | Login rate limiter window (minutes) |
| `AUTH_RATE_LIMIT_MAX` | — | `10` | Login rate limiter max attempts/window/IP |

**Production `ALLOWED_ORIGINS` example:**

```
ALLOWED_ORIGINS=https://swadyum.store,https://admin.swadyum.store
```

### 4.2 Local run

```bash
cd backend
cp .env.example .env      # fill in real Supabase credentials
npm install
npm run dev               # node --watch src/server.js (port 4000)
```

### 4.3 Production deployment (Render)

1. Create a **Web Service** on Render, pointing at this repo with root
   directory `backend/`.
2. Build command: `npm install`
3. Start command: `npm start` (which runs `node src/server.js`).
4. Set `NODE_ENV=production` and all env vars from §4.1 in Render's
   environment UI. Set `PORT` only if Render does not inject it (Render
   injects `PORT` automatically — do not override it).
5. Add a health check: Render should `GET` the root or any public route
   (e.g. `GET /api/categories?page=1&limit=1`) and expect `200`.

### 4.4 Verification

Once deployed, verify the backend is live:

```bash
# replace $BACKEND_URL with your Render URL, e.g. https://swadyum-api.onrender.com
curl -sS "$BACKEND_URL/api/categories?page=1&limit=1" | head
```

Expect a `200` with the standard envelope:

```json
{ "data": [ ... ], "pagination": { "page": 1, "limit": 1, "total": N, "totalPages": M } }
```

Then verify auth + RBAC are wired correctly:

```bash
# should return 401 (no token)
curl -sS -o /dev/null -w "%{http_code}\n" "$BACKEND_URL/api/auth/session"

# should return 401 (no token) for an admin-only route
curl -sS -o /dev/null -w "%{http_code}\n" "$BACKEND_URL/api/products" -X POST \
  -H "Content-Type: application/json" -d '{}'
```

---

## 5. Data Seeding (`scripts/data-migration/`)

The seeder extracts the **real, hardcoded catalog data** already living
in `src/` (categories, the mango-pickle product + PDP content, trust
badges, ingredients, FAQs, process steps, combos, and the `WELCOME10`
coupon) and pushes it into the database **exclusively through the
backend's authenticated admin REST API** — never via a direct Supabase
client. This guarantees every seeded row passes the same Zod validation,
RBAC (`requireAdmin`), and business logic the admin panel is bound by.
See [`scripts/data-migration/README.md`](scripts/data-migration/README.md).

### 5.1 Prerequisites

1. Node.js >= 18 (for built-in `fetch`).
2. The Phase 2 backend **must be running and reachable** (§4).
3. The Phase 1 schema migrations **must be applied** to Supabase (§3).
4. An admin/editor user **must be provisioned** in Supabase Auth with
   `profiles.role = 'Admin'` or `'Editor'` (§3.5).

### 5.2 Environment variables

Copy [`scripts/data-migration/.env.example`](scripts/data-migration/.env.example)
to `.env` inside `scripts/data-migration/`:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `BACKEND_BASE_URL` | — | `http://localhost:4000/api` | Base URL of the running backend API. In production, point this at your deployed backend (e.g. `https://swadyum-api.onrender.com/api`) |
| `SEED_ADMIN_EMAIL` | ✅ | — | Email of the admin/editor Supabase Auth user from §3.5 |
| `SEED_ADMIN_PASSWORD` | ✅ | — | Password for that user |

### 5.3 Setup and run

```bash
cd scripts/data-migration
npm install
cp .env.example .env
# edit .env: set BACKEND_BASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
node seed.js
# or: npm run seed
```

### 5.4 What the script does

1. Loads `.env` via `dotenv`.
2. Prints an **extraction manifest** (counts of every entity type found
   in `src/`) before touching the network.
3. Logs in via `POST /api/auth/login` and stores `session.access_token`;
   attaches `Authorization: Bearer <token>` to every subsequent request.
4. Seeds (in order): categories → category pairings → products (+ nested
   variants) → trust badges, ingredients, FAQs, process steps → combos
   (+ nested combo items) → deals (skipped, see §11) → coupons.
5. Reviews are extracted and printed for audit but **not POSTed** (no
   `POST /api/reviews` route exists in this phase).
6. Prints a final summary: created / skipped / patched / warnings /
   errors, with a detailed error list if any request failed.

### 5.5 Idempotency

The script is safe to re-run. Before every create it lists the target
collection and matches on a natural key:

| Entity | Match key |
|---|---|
| categories | `slug` |
| category_pairings | `label` (within a category) |
| products | `slug` |
| product_variants | `weight_label` (within a product) |
| trust_badges | `label` (within a product) |
| product_ingredients | `ingredient` (within a product) |
| product_faqs | `question` (within a product) |
| product_process_steps | `step_number` (within a product) |
| combos | `slug` |
| combo_items | `product_id` (within a combo) |
| coupons | `code` (case-insensitive) |

Anything already present is skipped (`✓ skip ...`), so running `node seed.js`
twice produces the same end state, not duplicates. The process exits
with code `1` if any errors occurred, `0` otherwise (CI-friendly).

### 5.6 Verification

After a successful run:

1. Log in to the admin panel (§6) and confirm the catalog appears:
   categories, the `mango-pickle` product with its 3 variants, trust
   badges, ingredients, FAQs, process steps, the `signature-mango` combo,
   and the `WELCOME10` coupon.
2. Hit the public backend routes to confirm reads work:
   ```bash
   curl -sS "$BACKEND_URL/api/products?search=mango" | head
   curl -sS "$BACKEND_URL/api/combos" | head
   curl -sS "$BACKEND_URL/api/categories" | head
   ```

---

## 6. Admin Panel Deployment (`admin/`)

### 6.1 Environment variables

Copy [`admin/.env.example`](admin/.env.example) to `.env.local` (Vite
only exposes vars prefixed with `VITE_` to the client bundle):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | ✅ | `http://localhost:4000/api` | Base URL of the Phase 2 backend API. The admin panel talks **only** to this API — it never calls Supabase directly for writes. In production, point this at your deployed backend (e.g. `https://swadyum-api.onrender.com/api`) |

**Production example:**

```
VITE_API_BASE_URL=https://swadyum-api.onrender.com/api
```

### 6.2 Local run

```bash
cd admin
cp .env.example .env.local
npm install
npm run dev               # Vite dev server
```

### 6.3 Build

```bash
cd admin
npm run build             # outputs to admin/dist/
```

### 6.4 Production deployment (Vercel)

The admin panel ships with a [`admin/vercel.json`](admin/vercel.json)
containing the SPA rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

To deploy on Vercel:

1. Import the repo into Vercel.
2. Set the **Root Directory** to `admin/`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add the environment variable `VITE_API_BASE_URL` from §6.1.
7. Deploy. The `vercel.json` rewrite ensures client-side routes (e.g.
   `/products/:id`) reload correctly without 404s.

### 6.5 Verification

1. Open the deployed admin URL.
2. Log in with the admin/editor credentials from §3.5.
3. Confirm the catalog seeded in §5 is visible across the list pages
   (Categories, Products, Combos, Coupons, Trust Badges, FAQs, Process
   Steps).
4. Open the `mango-pickle` product and confirm its 3 variants, trust
   badges, ingredients, FAQs, and process steps are present.
5. Confirm the admin token is stored in **`sessionStorage`** (not
   `localStorage`) — open DevTools → Application → Session Storage. This
   was hardened in Phase 5 (see §11).

---

## 7. Storefront Frontend Deployment (`src/`)

### 7.1 Environment variables

The storefront reads two Phase 2 integration flags from
[`src/.env.example`](src/.env.example) (Vite-prefixed):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_USE_NEW_BACKEND` | — | `false` | Feature flag. `true` attempts reading catalog from the new backend; anything else (or unset) keeps using existing mock/Supabase data. **Default/safe state: off.** |
| `VITE_BACKEND_BASE_URL` | — | `http://localhost:4000/api` | Base URL of the new backend's REST API. Only used when `VITE_USE_NEW_BACKEND=true`. |

The storefront also uses the legacy frontend vars from the root
[`.env.example`](.env.example) (Supabase URL/anon key, pickup location,
etc.) for the existing mock/Supabase-direct data paths and the legacy
checkout flow. See §9 for the full reference.

> **Critical sequencing rule (from `src/.env.example`):** Do **not** set
> `VITE_USE_NEW_BACKEND=true` in production until **both** of the
> following are true:
> 1. The Phase 1 schema migrations (§3) have been applied to the live
>    Supabase project.
> 2. The Phase 2 backend (§4) has been deployed and is reachable at
>    `VITE_BACKEND_BASE_URL`.
>
> Even when enabled, every `catalogService` call that fails for any
> reason (network error, non-2xx, unexpected shape) automatically falls
> back to the existing mock data — it will never break the page.

### 7.2 First deployment — flag OFF (no behavior change)

Deploy the storefront with `VITE_USE_NEW_BACKEND` unset or `false`. This
is a pure no-op release: the app behaves exactly as it does today, with
zero new code paths exercised. This isolates any deployment issues from
the backend integration.

```
VITE_USE_NEW_BACKEND=false
VITE_BACKEND_BASE_URL=https://swadyum-api.onrender.com/api
```

### 7.3 Local run

```bash
# from the repo root
npm install
npm run dev               # Vite dev server (Figma Make config, port 8443 by default)
```

### 7.4 Build

```bash
# from the repo root
npm run build             # vite build → dist/
```

### 7.5 Production deployment (Vercel)

A root [`vercel.json`](vercel.json) **does exist** in this repo (note:
this corrects an earlier assumption that none existed at root). It
contains the same SPA rewrite as `admin/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

To deploy the storefront on Vercel:

1. Import the repo into Vercel (root directory = repo root, **not**
   `admin/`).
2. Framework preset: **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables from §7.1 (and the legacy frontend vars
   from §9 as needed).
6. Deploy.

> **Note on the Vite config.** The root [`vite.config.ts`](vite.config.ts)
> includes Figma Make-specific plugins and defaults to port `8443` for
> the dev server. The production `vite build` output is a standard static
> bundle in `dist/` and is host-agnostic; the Figma plugins do not
> affect the built output.

### 7.6 Flip the flag ON (after verification)

Once the backend (§4) is live, the schema (§3) is applied, and the data
is seeded (§5), redeploy the storefront with:

```
VITE_USE_NEW_BACKEND=true
VITE_BACKEND_BASE_URL=https://swadyum-api.onrender.com/api
```

Because `VITE_USE_NEW_BACKEND` is a **build-time** flag (Vite inlines it
into the bundle), flipping it requires a **rebuild + redeploy**, not
just an env-var change at runtime.

### 7.7 Verification

1. Open the deployed storefront.
2. Confirm product listings, the PDP, combos, and categories render with
   real data from the backend (check the Network tab for requests to
   `VITE_BACKEND_BASE_URL`).
3. Temporarily set `VITE_BACKEND_BASE_URL` to an invalid URL (or stop
   the backend) and reload — the page should still render using mock
   fallback data, never break.
4. Confirm the legacy checkout flow still posts to the root `server.js`
   proxy (§8) and completes (or fails gracefully in mock-payment mode).

---

## 8. Post-Launch Verification Checklist

Run through every item before declaring the launch complete.

### 8.1 Database

- [ ] All six migration files (001–006) applied successfully in order.
- [ ] `enable_realtime_for_catalog.sql` re-run after migration.
- [ ] `review_storage_setup.sql` re-run after migration.
- [ ] No superseded legacy SQL files (§3.4) re-run after migration.
- [ ] At least one `profiles.role = 'Admin'` user exists (§3.5).
- [ ] RLS is enabled on all 33 canonical tables (verified in Phase 5 —
      no gaps found; see §11).

### 8.2 Backend API

- [ ] `backend/` deployed and reachable at its public URL.
- [ ] `NODE_ENV=production` set.
- [ ] `ALLOWED_ORIGINS` set to the exact storefront + admin origins
      (never `*`).
- [ ] `GET /api/categories?page=1&limit=1` returns `200` with the
      standard envelope.
- [ ] `GET /api/auth/session` returns `401` with no token.
- [ ] `POST /api/products` with no token returns `401`.
- [ ] Login rate limiter (`POST /api/auth/login`) is active (Phase 5
      verified — strict limiter in place).

### 8.3 Data seeding

- [ ] `node seed.js` exited with code `0`.
- [ ] Categories, `mango-pickle` product (+3 variants), trust badges,
      ingredients, FAQs, process steps, `signature-mango` combo, and
      `WELCOME10` coupon all visible in the admin panel.
- [ ] Known limitations (§11) reviewed and accepted.

### 8.4 Admin panel

- [ ] Deployed on Vercel with `VITE_API_BASE_URL` pointing at the
      backend.
- [ ] Login succeeds with admin credentials.
- [ ] Admin token stored in `sessionStorage` (not `localStorage`) —
      Phase 5 hardening confirmed.
- [ ] All list pages render seeded data.
- [ ] CRUD on at least one entity (e.g. edit a product, add a trust
      badge) succeeds and persists.

### 8.5 Storefront

- [ ] Deployed with `VITE_USE_NEW_BACKEND=false` first; site renders
      exactly as before.
- [ ] Redeployed with `VITE_USE_NEW_BACKEND=true`; catalog now reads
      from the backend.
- [ ] Backend-down fallback verified (page still renders from mock).
- [ ] Legacy checkout flow still posts to root `server.js` and
      completes (or fails gracefully in mock mode).

### 8.6 Legacy proxy + Edge Functions

- [ ] Root `server.js` deployed as a separate service on `PROXY_PORT`
      (default `3001`).
- [ ] Razorpay, Shiprocket, Fastrr env vars set (§9).
- [ ] Edge functions deployed and secrets set via
      `supabase secrets set` (§9).
- [ ] Phase 5 security fixes confirmed live (§11): no CORS wildcard in
      `send-whatsapp-message`, no session-secret fallback in
      `whatsapp-auth`, no hardcoded `VERIFY_TOKEN` fallback in
      `whatsapp-webhook`.

---

## 9. Environment Variables Master Reference Table

Every variable below is sourced from the actual `.env.example` files in
this repo. Variables are grouped by the surface that consumes them.

### 9.1 Backend API (`backend/.env.example`)

| Variable | Required | Default | Surface |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | — | backend |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | — | backend (server-only, never exposed) |
| `SUPABASE_ANON_KEY` | ✅ | — | backend |
| `PORT` | — | `4000` | backend |
| `NODE_ENV` | — | `development` | backend |
| `ALLOWED_ORIGINS` | — | *(empty)* | backend (CORS allow-list, never `*`) |
| `STORAGE_BUCKET_PRODUCT_IMAGES` | — | `product-images` | backend |
| `RATE_LIMIT_WINDOW_MIN` | — | `15` | backend |
| `RATE_LIMIT_MAX` | — | `100` | backend |
| `AUTH_RATE_LIMIT_WINDOW_MIN` | — | `15` | backend |
| `AUTH_RATE_LIMIT_MAX` | — | `10` | backend |

### 9.2 Admin panel (`admin/.env.example`)

| Variable | Required | Default | Surface |
|---|---|---|---|
| `VITE_API_BASE_URL` | ✅ | `http://localhost:4000/api` | admin (build-time) |

### 9.3 Storefront (`src/.env.example`)

| Variable | Required | Default | Surface |
|---|---|---|---|
| `VITE_USE_NEW_BACKEND` | — | `false` | storefront (build-time feature flag) |
| `VITE_BACKEND_BASE_URL` | — | `http://localhost:4000/api` | storefront (build-time, only used when flag is on) |

### 9.4 Data migration (`scripts/data-migration/.env.example`)

| Variable | Required | Default | Surface |
|---|---|---|---|
| `BACKEND_BASE_URL` | — | `http://localhost:4000/api` | seeder |
| `SEED_ADMIN_EMAIL` | ✅ | — | seeder |
| `SEED_ADMIN_PASSWORD` | ✅ | — | seeder |

### 9.5 Root / legacy frontend + proxy (`.env.example`)

These power the legacy root `server.js` proxy and the storefront's
existing mock/Supabase-direct data paths.

| Variable | Required | Default | Surface |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | `https://dligrptvajjsbzlcpjsk.supabase.co` | storefront (legacy paths) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | — | storefront (legacy paths) |
| `VITE_API_BASE_URL` | — | `http://localhost:3001/api` | storefront (legacy proxy) |
| `VITE_PICKUP_LOCATION` | — | `Primary` | storefront |
| `DATABASE_URL` | — | — | root helper scripts (`execute_sql.cjs`, `frontend/*.js`) — admin/migration only, never commit |
| `PROXY_PORT` | — | `3001` | root `server.js` |
| `RAZORPAY_KEY_ID` | — | — | root `server.js` (payments) |
| `RAZORPAY_KEY_SECRET` | — | — | root `server.js` (payments) |
| `MOCK_PAYMENTS` | — | `false` | root `server.js` (set `true` only in local dev) |
| `SHIPROCKET_EMAIL` | — | — | root `server.js` |
| `SHIPROCKET_PASSWORD` | — | — | root `server.js` |
| `SHIPROCKET_PICKUP_LOCATION` | — | `Primary` | root `server.js` |
| `FASTRR_API_KEY` | — | — | root `server.js` |
| `FASTRR_SECRET_KEY` | — | — | root `server.js` |
| `MOCK_WEBHOOKS` | — | `false` | root `server.js` (set `true` only in local dev) |
| `PUBLIC_STORE_URL` | — | `https://swadyum.store` | root `server.js` (Fastrr redirect default) |

### 9.6 Supabase Edge Functions (`.env.example`, set via `supabase secrets set`)

| Variable | Required | Surface |
|---|---|---|
| `SUPABASE_URL` | ✅ | edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | edge functions |
| `SUPABASE_ANON_KEY` | ✅ | edge functions |
| `SUPABASE_JWT_SECRET` | ✅ | `whatsapp-auth` (signs session tokens) |
| `WHATSAPP_ACCESS_TOKEN` | ✅ | `send-whatsapp-message`, `whatsapp-webhook` |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ | `send-whatsapp-message`, `whatsapp-webhook` |
| `RAZORPAY_KEY_ID` | ✅ | `razorpay` function |
| `RAZORPAY_KEY_SECRET` | ✅ | `razorpay` function |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | `razorpay` function |
| `FASTRR_API_KEY` | ✅ | `fastrr-checkout`, `fastrr-order-webhook` |
| `FASTRR_SECRET_KEY` | ✅ | `fastrr-checkout`, `fastrr-order-webhook` |

Set edge-function secrets with:

```bash
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  SUPABASE_ANON_KEY=... SUPABASE_JWT_SECRET=... \
  WHATSAPP_ACCESS_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=... \
  RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=... \
  FASTRR_API_KEY=... FASTRR_SECRET_KEY=...
```

---

## 10. Rollback / Safety Notes

### 10.1 Storefront flag rollback (fastest, no data impact)

Because `VITE_USE_NEW_BACKEND` defaults to `false` and every failed
backend read falls back to mock data, the safest rollback for a
storefront issue is to **redeploy with `VITE_USE_NEW_BACKEND=false`**.
This instantly restores the pre-integration behavior with no database
changes. The flag is build-time, so this requires a rebuild + redeploy,
not a runtime toggle.

### 10.2 Backend rollback

The backend is stateless (all state lives in Supabase). To roll back a
backend release, redeploy the previous Render build. Because the
schema migrations are idempotent and additive (`CREATE TABLE IF NOT
EXISTS`, `CREATE POLICY` after `DROP POLICY IF EXISTS`), rolling back
the backend does **not** require rolling back the database schema — the
old backend will continue to read the new schema's tables without issue.

### 10.3 Database rollback

The migration set is **additive and idempotent** — it does not drop or
rename existing user data. If you must revert the schema, do so by
restoring the Supabase project from the automatic nightly backup (or a
manual snapshot taken before applying §3). Do **not** attempt to reverse
the migrations by hand-running `DROP TABLE` statements; restore from
backup instead.

### 10.4 Seeding rollback

The seeder is idempotent and only **creates** rows (it never deletes or
overwrites existing rows). To undo a seed run, delete the seeded rows
via the admin panel or via SQL filtered by the natural keys in §5.5
(e.g. `delete from products where slug = 'mango-pickle'`). Re-running
the seeder will not duplicate rows.

### 10.5 Do-not list

- **Do not** re-run any superseded legacy SQL file from §3.4 after the
  new migration set is applied.
- **Do not** set `ALLOWED_ORIGINS=*` on the backend.
- **Do not** set `VITE_USE_NEW_BACKEND=true` before §3 and §4 are
  complete.
- **Do not** expose `SUPABASE_SERVICE_ROLE_KEY` to any client (storefront,
  admin, or edge function response body).
- **Do not** set `MOCK_PAYMENTS=true` or `MOCK_WEBHOOKS=true` in
  production.
- **Do not** relax RLS by re-running `relax_rls.sql`.

---

## 11. Known Limitations / Follow-up Items

These are documented limitations of the current phase, not oversights.
Most are intentional deferrals to later phases.

### 11.1 Seeding limitations (from `scripts/data-migration/README.md`)

- **Deals are not seeded.** `src/DealSection.jsx` only renders a
  client-side countdown timer with hardcoded `hours/minutes/seconds`
  state — there is no real deal title, product link, price, or
  start/end time anywhere in `src/`. `extractDeals()` returns `[]` and
  the seeder logs this loudly rather than fabricating data.
- **Reviews are not seedable via the API.** `backend/src/routes/reviews.routes.js`
  exposes only `GET`, `PUT`/`PATCH` (moderation), and `DELETE` — there
  is no `POST` route. The seeder extracts and prints the 7 candidate
  reviews it found for a human to decide what to do with later (e.g. a
  future public review-submission endpoint, or manual SQL seeding).
- **Combo-2 ("The Spicy Duo") is seeded with 0 combo_items.** None of its
  `includes` names (`Authentic Garlic`, `Stuffed Green Chilli`,
  `Sweet & Sour Lemon`) match any real product currently in `src/`.
  Only `mango-pickle` is a real, fully-built-out product at this stage.
  The seeder logs a clear warning rather than inventing fake products.
- **Product variants `mrp` and `stock_quantity` are seeded as `null`/`0`.**
  No real values exist in `src/` (only `price` per weight, via
  `standardPrices`). The seeder does not invent numbers.
- **Trust badge "FSSAI Registered" uses a `✅` emoji placeholder.** The
  source renders this badge with an `<img src="/fssai.png">`, but the
  `emoji` column is required and non-null. A neutral `✅` is used and
  the substitution is called out in code comments and the README.

### 11.2 Backend out-of-scope (from `backend/README.md`)

- **Public customer-facing endpoints** (cart, checkout, review
  submission, newsletter signup, WhatsApp OTP) remain served by the
  existing root `server.js` and Supabase Edge Functions — untouched by
  this phase.
- **`orders` has no `POST`/`DELETE` route** — orders originate from the
  checkout flow / payment webhooks (root `server.js`) and are a permanent
  business/audit record. The admin API can only `GET` and `PATCH` a
  narrow allow-list of fields (`status`, `payment_status`,
  `tracking_number`, `tracking_history`).
- **`reviews` has no `POST` route** — reviews are customer-submitted
  from the public storefront (a future phase), not admin-authored. The
  admin API surface is strictly for moderation.
- **`payments` and `coupon_usage` have no dedicated CRUD routes** — both
  are system-of-record tables populated by webhooks/callbacks. Exposing
  generic CRUD would risk admins corrupting financial reconciliation
  data.

### 11.3 Phase 5 security follow-ups

Phase 5 hardened several issues. The following were **fixed** and should
be confirmed live in §8:

1. **CORS wildcard in `send-whatsapp-message`** — fixed (no longer
   uses `*`).
2. **Session secret fallback to `SUPABASE_SERVICE_ROLE_KEY` in
   `whatsapp-auth`** — fixed (fallback removed; fails closed).
3. **Hardcoded `VERIFY_TOKEN` fallback in `whatsapp-webhook`** — fixed
   (fails closed with `403`).
4. **Admin token storage** — fixed (`localStorage` → `sessionStorage`
   in `admin/src/lib/apiClient.js`).

The following were **verified OK** in Phase 5 (no changes needed):

5. **RLS** — all 33 canonical tables verified; no gaps.
6. **Backend validator gaps** — verified OK.
7. **Rate limiting** — verified OK (global + strict login limiter).

The following were **flagged but not fixed** in Phase 5 (out of scope at
the time; track as follow-up):

8. **Hardcoded anon-key fallbacks** in `src/supabaseClient.js`,
   `admin/src/lib/supabase.js`, and root debug scripts (`check_*.js`,
   `frontend/run-supabase-query.js`). These are anon keys (RLS-protected,
   low severity) but still not ideal practice. Recommended follow-up:
   remove the hardcoded fallbacks and require the keys to come from env
   vars only.
9. **Root `server.js` CORS hardcodes localhost origins only** — no
   production domain is in the allow-list. Before going live with real
   checkout, add the production storefront origin to the root
   `server.js` CORS config.

### 11.4 Repo hygiene follow-ups

- **Mixed lockfiles at root.** Both `package-lock.json` and
  `pnpm-lock.yaml` exist at the repo root. Pick one (npm is recommended
  for consistency with the other subprojects) and remove the other to
  avoid ambiguity.
- **`backend/` has no committed lockfile.** Run `npm install` in
  `backend/` and commit the generated `package-lock.json` for
  reproducible builds.
- **Superseded legacy SQL files** (§3.4) are intentionally not deleted
  in this phase. Deletion is a separate, explicit decision for a later
  cleanup phase.

---

*End of guide. Every command, port, and environment variable above is
sourced from the actual files in this repository. See the linked
READMEs for additional detail.*
