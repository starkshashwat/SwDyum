# Mango Pickle Backend API (Phase 2)

A standalone Express + Supabase REST API for the Mango Pickle e-commerce
storefront's admin/catalog/commerce operations. This backend is authored
independently of the existing root `server.js` (which continues to serve
Shopify-compat + Shiprocket/Razorpay routes) and the `admin/` SPA — it does
not modify or depend on either.

## Tech Stack

- **Node.js** (ESM — `"type": "module"`)
- **Express 4** — routing/middleware
- **Supabase JS v2** (`@supabase/supabase-js`) — Postgres access + Auth
- **Zod** — request validation (body/query/params)
- **express-rate-limit** — global + auth-specific rate limiting
- **helmet** — secure HTTP headers
- **cors** — explicit origin allow-listing
- **multer** — multipart file upload handling (memory storage)
- **morgan** — HTTP request logging
- **dotenv** — environment variable loading

## Getting Started

```bash
cd backend
cp .env.example .env      # fill in real Supabase credentials
npm install                # NOT run by the authoring agent — run this yourself
npm run dev                 # node --watch src/server.js
```

The server validates required environment variables at boot
(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`) and exits
immediately with a clear error message if any are missing.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | — | Service-role key (bypasses RLS) — server-side only, NEVER expose to any client |
| `SUPABASE_ANON_KEY` | ✅ | — | Anon/public key — used for token verification & RLS-respecting reads |
| `PORT` | — | `4000` | HTTP port the API listens on |
| `NODE_ENV` | — | `development` | Controls error verbosity (`production` hides stack traces) |
| `ALLOWED_ORIGINS` | — | *(empty = allow all non-browser callers)* | Comma-separated CORS allow-list, e.g. `https://swadyum.com,https://admin.swadyum.com` |
| `STORAGE_BUCKET_PRODUCT_IMAGES` | — | `product-images` | Supabase Storage bucket used by `/api/upload/image` |
| `RATE_LIMIT_WINDOW_MIN` | — | `15` | Global rate limiter window (minutes) |
| `RATE_LIMIT_MAX` | — | `100` | Global rate limiter max requests/window/IP |
| `AUTH_RATE_LIMIT_WINDOW_MIN` | — | `15` | Login rate limiter window (minutes) |
| `AUTH_RATE_LIMIT_MAX` | — | `10` | Login rate limiter max attempts/window/IP |

## File Structure

```
backend/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── server.js                       # App entrypoint: middleware, route mounting, listen
    ├── config/
    │   ├── env.js                      # validateEnv() + typed `env` config object
    │   └── supabaseClient.js           # supabaseAnon (RLS) + supabaseAdmin (service-role)
    ├── middleware/
    │   ├── auth.js                     # requireAuth / optionalAuth (Bearer token verification)
    │   ├── requireAdmin.js             # RBAC check against profiles.role (Admin/Editor)
    │   ├── validate.js                 # Generic zod-schema validation middleware factory
    │   ├── errorHandler.js             # Centralized error handler + 404 handler
    │   └── rateLimiter.js              # globalLimiter + authLoginLimiter
    ├── utils/
    │   ├── asyncHandler.js             # Wraps async route handlers, forwards rejections to next()
    │   └── logger.js                   # Minimal structured console logger
    ├── validators/                     # One *.schema.js per resource (zod schemas)
    │   ├── common.schema.js
    │   ├── category.schema.js
    │   ├── product.schema.js
    │   ├── productImage.schema.js
    │   ├── productIngredient.schema.js
    │   ├── trustBadge.schema.js
    │   ├── faq.schema.js
    │   ├── processStep.schema.js
    │   ├── combo.schema.js
    │   ├── deal.schema.js
    │   ├── coupon.schema.js
    │   ├── review.schema.js
    │   ├── order.schema.js
    │   ├── auth.schema.js
    │   └── announcement.schema.js
    ├── controllers/                    # One *.controller.js per resource (business logic)
    │   ├── categories.controller.js
    │   ├── products.controller.js
    │   ├── productImages.controller.js
    │   ├── productIngredients.controller.js
    │   ├── trustBadges.controller.js
    │   ├── faqs.controller.js
    │   ├── processSteps.controller.js
    │   ├── combos.controller.js
    │   ├── deals.controller.js
    │   ├── coupons.controller.js
    │   ├── reviews.controller.js
    │   ├── orders.controller.js
    │   ├── auth.controller.js
    │   ├── upload.controller.js
    │   └── announcements.controller.js
    └── routes/                         # One *.routes.js per resource (thin wiring only)
        ├── categories.routes.js
        ├── products.routes.js
        ├── productImages.routes.js
        ├── productIngredients.routes.js
        ├── trustBadges.routes.js
        ├── faqs.routes.js
        ├── processSteps.routes.js
        ├── combos.routes.js
        ├── deals.routes.js
        ├── coupons.routes.js
        ├── reviews.routes.js
        ├── orders.routes.js
        ├── auth.routes.js
        ├── upload.routes.js
        └── announcements.routes.js
```

## Authentication & Authorization Model

- **`requireAuth`** — requires a valid `Authorization: Bearer <token>` header.
  The token is verified via `supabaseAnon.auth.getUser(token)` (never
  hand-decoded). Returns `401` if missing/invalid.
- **`optionalAuth`** — attempts the same verification but never rejects the
  request; if a valid token is present, `req.user` is populated, otherwise
  the request proceeds anonymously. Used on public catalog GET routes.
- **`requireAdmin`** — always used *after* `requireAuth`. Looks up the
  caller's `profiles` row (via `supabaseAdmin`, bypassing RLS) and requires
  `role` to be `'Admin'` or `'Editor'` (mirrors the SQL `is_admin()`
  function from `004_auth_roles.sql`). Returns `403` otherwise. `req.profile`
  is attached for downstream handlers.

## API Reference

Base path for all resource routes: `/api`. Auth column key: **Public** = no
token required · **Auth** = valid bearer token required · **Admin** =
bearer token + `Admin`/`Editor` role required.

### Categories — `/api/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List categories (paginated, searchable) |
| GET | `/:id` | Public | Get one category |
| GET | `/:categoryId/pairings` | Public | List pairings for a category |
| POST | `/` | Admin | Create category |
| PUT/PATCH | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |
| POST | `/:categoryId/pairings` | Admin | Create category pairing |
| PUT/PATCH | `/:categoryId/pairings/:id` | Admin | Update category pairing |
| DELETE | `/:categoryId/pairings/:id` | Admin | Delete category pairing |

### Products — `/api/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List products (paginated, searchable, filterable) |
| GET | `/:id` | Public | Get one product |
| GET | `/:productId/variants` | Public | List variants for a product |
| GET | `/:productId/variants/:id` | Public | Get one variant |
| POST | `/` | Admin | Create product |
| PUT/PATCH | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |
| POST | `/:productId/variants` | Admin | Create variant |
| PUT/PATCH | `/:productId/variants/:id` | Admin | Update variant |
| DELETE | `/:productId/variants/:id` | Admin | Delete variant |

### Product Images — `/api/product-images`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?product_id=` | Public | List images (optionally scoped to a product) |
| GET | `/:id` | Public | Get one image record |
| POST | `/` | Admin | Create image record |
| PUT/PATCH | `/:id` | Admin | Update image record |
| DELETE | `/:id` | Admin | Delete image record |

### Product Ingredients — `/api/product-ingredients`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?product_id=` | Public | List ingredients (optionally scoped) |
| GET | `/:id` | Public | Get one ingredient |
| POST | `/` | Admin | Create ingredient |
| PUT/PATCH | `/:id` | Admin | Update ingredient |
| DELETE | `/:id` | Admin | Delete ingredient |

### Trust Badges — `/api/trust-badges`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List trust badges |
| GET | `/:id` | Public | Get one trust badge |
| POST | `/` | Admin | Create trust badge |
| PUT/PATCH | `/:id` | Admin | Update trust badge |
| DELETE | `/:id` | Admin | Delete trust badge |

### FAQs — `/api/faqs`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List FAQs |
| GET | `/:id` | Public | Get one FAQ |
| POST | `/` | Admin | Create FAQ |
| PUT/PATCH | `/:id` | Admin | Update FAQ |
| DELETE | `/:id` | Admin | Delete FAQ |

### Process Steps — `/api/process-steps`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List process steps |
| GET | `/:id` | Public | Get one process step |
| POST | `/` | Admin | Create process step |
| PUT/PATCH | `/:id` | Admin | Update process step |
| DELETE | `/:id` | Admin | Delete process step |

### Combos — `/api/combos`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List combos |
| GET | `/:id` | Public | Get one combo |
| GET | `/:comboId/items` | Public | List items in a combo |
| POST | `/` | Admin | Create combo |
| PUT/PATCH | `/:id` | Admin | Update combo |
| DELETE | `/:id` | Admin | Delete combo |
| POST | `/:comboId/items` | Admin | Add item to combo |
| PUT/PATCH | `/:comboId/items/:id` | Admin | Update combo item |
| DELETE | `/:comboId/items/:id` | Admin | Remove combo item |

### Deals — `/api/deals`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List deals |
| GET | `/:id` | Public | Get one deal |
| POST | `/` | Admin | Create deal |
| PUT/PATCH | `/:id` | Admin | Update deal |
| DELETE | `/:id` | Admin | Delete deal |

### Coupons — `/api/coupons` (admin-only, no public reads)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List coupons |
| GET | `/:id` | Admin | Get one coupon |
| POST | `/` | Admin | Create coupon |
| PUT/PATCH | `/:id` | Admin | Update coupon (never touches `used_count`) |
| DELETE | `/:id` | Admin | Delete coupon |

### Reviews (moderation) — `/api/reviews` (admin-only, no POST)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List reviews |
| GET | `/:id` | Admin | Get one review |
| PUT/PATCH | `/:id` | Admin | Moderate (`is_approved`, `is_featured` only) |
| DELETE | `/:id` | Admin | Delete review |

### Orders — `/api/orders` (admin-only, no POST/DELETE)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List orders (filterable by status/payment_status/email/date range) |
| GET | `/:id` | Admin | Get one order with nested `order_items` |
| PATCH | `/:id` | Admin | Update `status` / `payment_status` / `tracking_number` / `tracking_history` only |

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | Public (strict rate limit) | Email/password login via Supabase Auth |
| GET | `/session` | Auth | Return current session's user + profile |
| POST | `/logout` | Auth | Invalidate current session |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/image` | Admin | Upload an image (multipart, field `image`, ≤5MB, jpeg/png/webp) to Supabase Storage; returns public URL |

### Announcements — `/api/announcements` (bonus, not in primary spec)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List announcements |
| GET | `/:id` | Public | Get one announcement |
| POST | `/` | Admin | Create announcement |
| PUT/PATCH | `/:id` | Admin | Update announcement |
| DELETE | `/:id` | Admin | Delete announcement |

All list endpoints accept `?page=1&limit=20&search=` query params (zod-validated,
`limit` capped at 100) and return a consistent envelope:

```json
{
  "data": [ /* rows */ ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

## Security Measures

- **`helmet()`** — sets secure HTTP response headers by default.
- **`cors()`** — explicit `ALLOWED_ORIGINS` allow-list; `origin: '*'` is
  never used. Non-browser requests (no `Origin` header) are permitted since
  they cannot exploit CSRF-style cross-origin attacks.
- **`express-rate-limit`** — a moderate global limiter on every request,
  plus a strict dedicated limiter on `POST /api/auth/login` to blunt
  credential-stuffing/brute-force attempts.
- **`express.json({ limit: '1mb' })`** — caps request body size.
- **Zod validation on every mutating/query endpoint** — bodies, query
  strings, and `:id` route params are all parsed and rejected (`400`) on
  the first sign of malformed/unexpected input before touching the
  database. String fields also reject an embedded `<script` tag as a
  defense-in-depth measure against stored-XSS payloads (RLS/CSP/output
  encoding remain the primary defenses; this is a secondary net).
- **No raw SQL / string-built queries anywhere** — 100% of database access
  goes through the official `@supabase/supabase-js` query builder, which
  parameterizes every value.
- **Dual Supabase client separation** — `supabaseAnon` (RLS-respecting,
  used for auth/token verification and any place where relying on RLS is
  intentional) vs `supabaseAdmin` (service-role, RLS-bypassing, used only
  in controllers/RBAC checks where an admin-authenticated request has
  already been verified). This separation is documented extensively in
  `config/supabaseClient.js`.
- **Centralized error handler** — production responses never leak stack
  traces, raw Postgres/Supabase error objects, or any internal detail;
  development responses include stack traces to aid debugging. The
  `SUPABASE_SERVICE_ROLE_KEY` is never included in any response body under
  any circumstance.
- **404 handler** — registered after all real routes so unmatched requests
  get a clean JSON `404` instead of Express's default HTML error page.
- **Multer memory storage + MIME allow-list + 5MB cap** on the only file
  upload endpoint — uploaded files never touch the server's filesystem.

## Documented Assumptions & Design Decisions

1. **Nested resources** — `product_variants`, `category_pairings`, and
   `combo_items` are exposed as *nested* routes under their parent
   (`/products/:productId/variants`, `/categories/:categoryId/pairings`,
   `/combos/:comboId/items`) rather than flat top-level resources, since
   they have no meaningful existence independent of their parent and this
   mirrors common REST conventions for owned child collections.
   `product_images` and `product_ingredients` are kept as **top-level**
   routes (per the explicitly required file structure) but scoped via a
   `product_id` query parameter / body field instead of a path segment.

2. **`announcements`** — not explicitly named in the primary required
   route list, but included as a bonus resource since the `announcements`
   table exists in the schema (`002_content_entities.sql`) and is a natural
   fit for the same public-read/admin-write CRUD pattern as other catalog
   content.

3. **`payments` and `coupon_usage`** — intentionally **not** given their
   own CRUD route/controller/validator files. Both tables are
   system-of-record tables populated exclusively by payment
   webhooks/gateway callbacks and order-processing logic (outside this
   phase's scope) rather than by direct admin CRUD. Exposing generic CRUD
   over them would risk admins manually corrupting financial reconciliation
   data. `payments` data is instead surfaced read-only via the nested view
   on `GET /api/orders/:id` where relevant; `coupon_usage.used_count` is
   read (never admin-writable) via `GET /api/coupons`.

4. **`product_reviews` has no POST route** — reviews are customer-submitted
   from the public storefront (a future phase's concern), not admin-authored.
   This admin API surface is strictly for **moderation** (`GET` list/one,
   `PATCH`/`PUT` to toggle `is_approved`/`is_featured`, `DELETE` to remove
   abusive content) — matching the task's explicit rule.

5. **`orders` has no POST or DELETE route** — orders originate from the
   checkout flow / payment gateway webhooks (handled by the existing root
   `server.js`, untouched by this phase) and are a permanent business/audit
   record. The admin API can only `GET` (list/single, with nested
   `order_items`) and `PATCH` a narrow allow-list of fields (`status`,
   `payment_status`, `tracking_number`, `tracking_history`) — never a full
   `PUT` replace, to avoid accidentally clobbering financial/customer data.

6. **RBAC mirrors `is_admin()`** — rather than re-implementing the Postgres
   `is_admin()` SECURITY DEFINER function's exact logic in JS, `requireAdmin`
   performs the equivalent check by querying `profiles.role` directly via
   the service-role client, accepting `'Admin'` or `'Editor'` as authorized
   roles (matching `004_auth_roles.sql`).

7. **Pagination defaults** — every list endpoint defaults to `page=1`,
   `limit=20`, with `limit` hard-capped at `100` via zod's
   `.max(100)` to prevent a single request from requesting the entire table.

## Out of Scope (this phase)

- Public customer-facing endpoints (cart, checkout, review submission,
  newsletter signup, WhatsApp OTP) — these remain served by the existing
  root `server.js` / Supabase Edge Functions and are untouched.
- Any modification to `src/`, `admin/`, or root `server.js`.
- Running `npm install` or starting the server against a live Supabase
  project — this phase is authoring-only; running/testing is left to the
  developer.
