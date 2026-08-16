# Swadyum Data Migration / Seed Script

Standalone Node.js script that extracts the **real, hardcoded catalog data**
already living in the root `src/` frontend (categories, the mango-pickle
product + PDP content, trust badges, ingredients, FAQs, process steps,
combos, and the `WELCOME10` coupon) and pushes it into the database
**exclusively through the Phase 2 backend's authenticated admin REST API**
(`backend/`) — never via a direct Supabase client. This guarantees every
seeded row passes the same Zod validation, RBAC (`requireAdmin`), and
business logic the admin panel itself is bound by.

This directory is fully self-contained. It does **not** modify anything in
`src/`, `backend/`, `admin/`, or `migrations/` — it only reads from `src/`
and writes to the live API.

---

## What gets seeded (and what doesn't)

| Entity | Source file(s) | Seeded? |
|---|---|---|
| Categories (`pickles`, `mango-pickle`) | `src/CategoryPage.jsx` (categoriesData) | ✅ |
| Category pairings | `src/CategoryPage.jsx` (pairingsData) | ✅ (associated with `mango-pickle`) |
| Product `mango-pickle` + `pdp_config` | `src/data/products.js`, `src/data/pdpContentMap.js` | ✅ |
| Product variants (250g/500g/1kg) | `src/data/products.js` (`standardPrices`) | ✅ (no MRP/stock in source → defaults) |
| Trust badges | `src/SocialProofSection.jsx`, `src/components/cart/CartDrawer.jsx` | ✅ (deduped by label; FSSAI badge's `<img>` swapped for a placeholder emoji since `emoji` is required) |
| Ingredients | `src/data/pdpContentMap.js` (`ingredients_table`) | ✅ (no `percentage` data in source → `null`) |
| FAQs | `src/data/pdpContentMap.js` (`faq`) | ✅ |
| Process steps | `src/components/pdp/PdpProcessTimeline.jsx` | ✅ |
| Combos | `src/ComboOfferSection.jsx` | ✅ (combo records only — see combo_items caveat below) |
| Combo items | `src/ComboOfferSection.jsx` (`includes`) | ⚠️ **partial** — only `"Signature Mango"` resolves to the real `mango-pickle` product. `"Authentic Garlic"`, `"Stuffed Green Chilli"`, `"Sweet & Sour Lemon"` have **no matching real product** in `src/`, so `combo-2` ("The Spicy Duo") ends up with **zero** combo_items — the script logs a clear warning rather than inventing fake products. |
| Deals | `src/DealSection.jsx` | ❌ **not seeded** — this component only renders a client-side visual countdown timer (hardcoded `hours/minutes/seconds` state); there is no real deal title, product link, price, or start/end time anywhere in `src/`. Fabricating one would violate the "never invent data" rule, so `extractDeals()` returns `[]` and the seeder logs this explicitly. |
| Coupon `WELCOME10` | `src/components/cart/CartDrawer.jsx` (client-side `if (couponCode === 'WELCOME10') discount = subtotal * 0.1`) | ✅ (borderline — the coupon only exists as a hardcoded string+multiplier in a UI component, not a data module, but the values are real and unambiguous) |
| Reviews | `src/CategoryPage.jsx` (`customerReviewsData`) + `src/ReviewsPage.jsx` (`initialReviews`), 7 total | ❌ **not seedable** — `backend/src/routes/reviews.routes.js` exposes **only** `GET` (list/detail), `PUT`/`PATCH` (moderation: `is_approved`/`is_featured` only), and `DELETE`. There is **no `POST` route** — reviews are meant to be created by real customers via a separate public-facing surface that doesn't exist yet in this phase. The script still extracts and prints these 7 candidate reviews for audit purposes but does not attempt to POST them. |

---

## Prerequisites

1. **Node.js >= 18** (for built-in `fetch`; matches the backend's own `engines` requirement).
2. The **Phase 2 backend must be running** and reachable (default `http://localhost:4000`):
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. A working Supabase project with the Phase 1 schema migrations applied (`migrations/v2_normalized_schema/001..006`), and `backend/.env` configured with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGINS`.
4. An **admin or editor user** already provisioned in Supabase Auth whose corresponding `profiles.role` is `'Admin'` or `'Editor'` (checked by `backend/src/middleware/requireAdmin.js`). This is the same account used to log into the admin panel. If you don't have one yet, create it via the admin panel's own signup/provisioning flow (or directly in Supabase).

---

## Setup

```bash
cd scripts/data-migration
npm install
cp .env.example .env
# edit .env: set BACKEND_BASE_URL (if not default), SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
```

## Run

```bash
node seed.js
```

or, from inside `scripts/data-migration/`:

```bash
npm run seed
```

---

## What the script does, step by step

1. Loads `.env` (via `dotenv`).
2. Prints an **extraction manifest** — a count of every entity type it found in `src/`, before touching the network.
3. **Logs in** via `POST /api/auth/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. This proxies to Supabase Auth (`signInWithPassword`) and returns a session; the script stores `session.access_token` and attaches `Authorization: Bearer <token>` to every subsequent request.
4. **Categories** — lists existing categories, skips any whose `slug` already exists, otherwise `POST /api/categories`.
5. **Category pairings** — nested under `/api/categories/:categoryId/pairings`, matched by `label`.
6. **Products** — lists existing products, skips by `slug`, otherwise `POST /api/products` (including the full `pdp_config` JSONB blob). Then seeds **variants** nested under `/api/products/:productId/variants`, matched by `weight_label`.
7. **Trust badges, ingredients, FAQs, process steps** — all top-level routes accepting `product_id` in the body; the script resolves `product_id` from the product's `slug`, lists existing rows filtered by `?product_id=`, and matches by a natural key (`label`, `ingredient`, `question`, `step_number` respectively) before deciding to skip or create.
8. **Combos** — matched by `slug`; then **combo_items** nested under `/api/combos/:comboId/items`, matched by `product_id`. Unresolvable `includes` names are logged as warnings, not fabricated.
9. **Deals** — explicitly skipped with a log message (no real source data).
10. **Coupons** — matched by `code` (case-insensitive), otherwise `POST /api/coupons`.
11. **Reviews** — extracted and printed for audit, but never POSTed (no route exists).
12. Prints a final **summary**: counts of created / skipped / patched / warnings / errors, plus a detailed error list if any request failed.

---

## Idempotency

The script is safe to re-run. Before every create it first lists the target
collection (paginating through the standard `{ data, pagination }` envelope)
and matches on a natural key:

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

Anything already present is skipped (logged with `✓ skip ...`), so running
`node seed.js` twice in a row produces the same end state, not duplicates.

---

## Continue-on-error behavior

Every single API call (per category, per product, per variant, per badge,
etc.) is wrapped in its own `try/catch`. A failure on one row (e.g. a
validation error) is logged immediately and added to the final error report,
but does **not** stop the rest of the run — every other entity still gets
attempted. The process exits with code `1` if any errors occurred, `0`
otherwise, so it's CI-friendly.

---

## Files in this directory

| File | Purpose |
|---|---|
| `extract.js` | Pure functions that return the real data transcribed from `src/`. No I/O, no network — safe to unit-test or `console.log` in isolation. |
| `apiClient.js` | Minimal authenticated fetch wrapper (`login`, `get`, `post`, `put`, `patch`, `del`) pointed at `BACKEND_BASE_URL`. |
| `seed.js` | Orchestrates login → categories → products (+variants) → child entities (badges/ingredients/faqs/process steps) → combos (+items) → deals (skip) → coupons → reviews (report-only) → summary. |
| `.env.example` | Documents the three env vars this script needs. |
| `package.json` | Only dependency: `dotenv`. `type: module` (ESM), matches root/backend convention. |
| `README.md` | This file. |

---

## Known limitations (by design, not oversight)

- **Deals**: zero real source data exists; nothing is seeded, and this is logged loudly rather than silently skipped.
- **Reviews**: cannot be created via the admin API at all in this phase (no POST route). The script surfaces the 7 candidate reviews it found for a human to decide what to do with later (e.g. a future public review-submission endpoint, or manual seeding via SQL if that's ever deemed acceptable outside this script's scope).
- **Combo-2 ("The Spicy Duo")**: will be created as a combo record with its price/description, but with **0 combo_items**, because none of its `includes` names (`Authentic Garlic`, `Stuffed Green Chilli`) match any real product currently in `src/`. Only `mango-pickle` is a real, fully-built-out product at this stage of the rebuild.
- **Product variants**: `mrp` and `stock_quantity` have no real values anywhere in `src/` (only `price` exists per weight, via `standardPrices`), so they're seeded as `null`/`0` respectively rather than invented numbers.
- **Trust badge "FSSAI Registered"**: the source renders this one with an `<img src="/fssai.png">` instead of an emoji, but the `emoji` column is required and non-null. A neutral `✅` placeholder is used, and this substitution is called out both in code comments and in this README rather than silently done.
