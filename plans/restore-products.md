# Plan: Restore Missing Products to the Shop Page

## Root Cause (confirmed)
- Products are **not** stored in code. [`src/data/products.js`](src/data/products.js:12) fetches them live from Supabase via `fetchProducts()`, filtering `.eq('is_active', true)`.
- The PDP redesign only touched UI components/CSS — it could **not** have deleted products.
- The Supabase `products` table is empty (or rows have `is_active = false`), so the shop page shows nothing.
- Direct postgres seeding is **blocked**: the password in [`execute_sql.cjs`](execute_sql.cjs:1) (`Mohinozoku@1`) is outdated — auth fails (code 28P01).
- The anon key (found in [`check_rls.js`](check_rls.js:4)) allows **read-only** access under RLS — it **cannot INSERT** products.
- A ready seed file already exists: [`migrations/seed_products.sql`](migrations/seed_products.sql:1) — inserts 3 products (mango, garlic, mixed pickle) with variants + images.

## Additional issue found
- [`src/supabaseClient.js`](src/supabaseClient.js:9) reads `VITE_SUPABASE_ANON_KEY` from env, but [`.env.local`](.env.local:1) does **not** contain it. The frontend currently falls back to `'missing-anon-key'`, which means **even after seeding, product reads may fail**. This must be fixed for the shop page to work.

## Restore Path
Since direct postgres is blocked and the anon key is read-only, the reliable path is:
1. Add `VITE_SUPABASE_ANON_KEY` to `.env.local` (key is known and present in `check_rls.js`).
2. Provide a hardened, idempotent seed SQL (based on `migrations/seed_products.sql`) for the user to paste into the **Supabase SQL Editor** (Dashboard → SQL → New query → Run). This inserts 3+ products with variants + images.
3. User runs the seed; products appear on the shop page immediately.

## Actionable Steps

### Step 1 — Fix frontend Supabase auth (`.env.local`)
Add the anon key so the client can read products:
```
VITE_SUPABASE_URL=https://dligrptvajjsbzlcpjsk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM
```
(Only add if not already present; preserve existing Shiprocket/Razorpay/GoKwik/Fastrr keys.)

### Step 2 — Prepare hardened seed SQL
Create [`migrations/restore_products.sql`](migrations/restore_products.sql:1) — idempotent, safe to re-run:
- `INSERT ... ON CONFLICT (slug) DO UPDATE` for the category.
- `INSERT ... ON CONFLICT (slug) DO NOTHING` for products (3 products: mango-pickle, garlic-pickle, mixed-pickle).
- Insert variants (250g/500g/1kg) with `ON CONFLICT DO NOTHING` keyed on `(product_id, weight_label)`.
- Insert primary images (`/prod_mango.webp`, `/prod_garlic.webp`, `/prod_mixed.webp`).
- Guard `pure_ingredients` column with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so the seed won't fail if the column is missing.
- Set `is_active = true` on all inserted products.

### Step 3 — User runs the seed in Supabase SQL Editor
- Open Supabase Dashboard → SQL Editor → New query.
- Paste contents of `migrations/restore_products.sql`.
- Click **Run**. Expect "Success. No rows returned" or row counts.
- (Optional) Verify: `SELECT slug, is_active FROM products;` should show 3 active rows.

### Step 4 — Verify on the shop page
- Restart the dev server (so `.env.local` is picked up).
- Open the shop page — 3 products should render.
- Open a PDP — product detail, variants, and images should load.

## Notes
- No code in `src/` needs to change for product listing to work — the data layer is correct.
- If the user prefers, the same seed can be expanded to all 10 products from [`seed.sql`](seed.sql:1) later.
- The broken postgres password in `execute_sql.cjs` / `frontend/seed-products.js` / `frontend/run-sql.js` should be updated separately (out of scope here) if direct-DB scripting is needed in future.
