# v2_normalized_schema — Phase 1 Canonical Schema Migrations

This migration set implements the normalized Supabase/PostgreSQL schema
designed in section 4 ("Proposed Normalized Schema") of
[`plans/mango-pickle-fullstack-plan.md`](../../plans/mango-pickle-fullstack-plan.md).

It reconciles the many conflicting, ad-hoc SQL files that accumulated in the
project root (see plan §2.1) into a single, idempotent, reviewed set of DDL.

> ⚠️ **Do NOT execute these migrations against a live Supabase instance as
> part of this task.** This set is authored for review only. Actual application
> happens in a later phase after user review and a data-migration dry run.

---

## Run Order

Run the files in strict numeric order inside a single transaction per file.
Each file is wrapped in `BEGIN; ... COMMIT;` and is idempotent
(`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`,
`DROP POLICY IF EXISTS` before `CREATE POLICY`, `CREATE OR REPLACE` for
functions/views), so re-running a file is safe.

| # | File | Tables / Objects |
|---|------|------------------|
| 1 | [`001_categories_products.sql`](001_categories_products.sql) | `categories`, `category_pairings`, `products`, `product_variants`, `product_images`, `product_ingredients` |
| 2 | [`002_content_entities.sql`](002_content_entities.sql) | `product_trust_badges`, `product_faqs`, `product_process_steps`, `combos`, `combo_items`, `deals`, `announcements`, `offers` |
| 3 | [`003_commerce.sql`](003_commerce.sql) | `orders`, `order_items`, `payments`, `coupons`, `coupon_usage`, `product_reviews` + `reviews` compatibility VIEW |
| 4 | [`004_auth_roles.sql`](004_auth_roles.sql) | `profiles`, `admin_roles`, `admin_user_roles`, `addresses`, `subscriptions`, `invoices`, `inventory_logs`, `blogs`, `newsletter_subscribers`, `seo_metadata`, `whatsapp_messages`, `whatsapp_otps`, `account_deletion_requests`, `is_admin()` function |
| 5 | [`005_rls_policies.sql`](005_rls_policies.sql) | RLS enable + policies for **every** table in files 1–4 |
| 6 | [`006_indexes_triggers.sql`](006_indexes_triggers.sql) | Indexes + `set_updated_at()` trigger function + `BEFORE UPDATE` triggers on all tables with `updated_at` |

**Dependency note:** File 3 (`orders`) depends on `profiles` from file 4.
Run file 4 before file 3 if you split the set across separate transactions,
or run the whole set in one transaction. The numeric ordering above is the
intended logical reading order; when applying, ensure `profiles` exists
before `orders`/`coupon_usage`/`invoices`/`subscriptions` FKs resolve.

---

## Canonical Decisions

### 1. `orders` table shape (3-way conflict — plan §2.2.1)

The codebase had three conflicting `orders` shapes:

- **Shape A** — `complete_schema.sql` / `CartDrawer.jsx:212-223`:
  `customer_id`, `total`, `customer_email`, `customer_phone`,
  `shipping_address` (JSONB)
- **Shape B** — `create_orders_tables.sql`: different column names/types
- **Shape C** — `fastrr-order-webhook/index.ts:117-124`:
  `user_id`, `total_amount`, `contact_email`, `contact_phone`,
  `shipping_address` (string)

**Decision: Shape A is canonical**, extended with the tracking columns from
`migrations/add_checkout_tracking_columns.sql` and Razorpay payment fields.

**Rationale:** Shape A matches the LIVE frontend order-creation path
(`CartDrawer.jsx`), which is the primary write surface. Adopting it minimizes
frontend churn. Shape C rows (fastrr webhook) map cleanly into Shape A:

| Shape C | Canonical (Shape A) |
|---------|---------------------|
| `user_id` | `customer_id` |
| `total_amount` | `total` |
| `contact_email` | `customer_email` |
| `contact_phone` | `customer_phone` |
| `shipping_address` (string) | `shipping_address` (JSONB via cast) |

The data migration itself is deferred to a later phase; this set only defines
the canonical DDL.

### 2. `reviews` vs `product_reviews` naming (plan §2.2.2)

- Schema files (`supabase_schema.sql`, `complete_schema.sql`) named the
  table `reviews`.
- The LIVE frontend (`src/data/reviews.js:72-79`) and admin
  (`admin/src/pages/ReviewsList.jsx:16-34`) both target `product_reviews`.

**Decision: `product_reviews` is the canonical table name.**

**Rationale:** Both the live frontend and admin already use `product_reviews`,
so adopting it requires zero client code changes. The name is also more
descriptive and avoids collision with a future generic "site reviews" table.

A read-only compatibility **VIEW** named `reviews` is created in
[`003_commerce.sql`](003_commerce.sql) so legacy tooling still referencing
`reviews` continues to read rows. Inserts must go to `product_reviews`.

---

## Superseded Legacy SQL Files

The following legacy SQL files in the project root and `migrations/` folder
are **SUPERSEDED** by this migration set. They define overlapping/conflicting
versions of the same tables and should **NOT be re-run** once this set is
applied. They are intentionally **not deleted** here — only documented as
superseded. Deletion is a separate, explicit decision for a later phase.

### Project root SQL files (superseded)

| Legacy file | Superseded by |
|-------------|---------------|
| [`complete_schema.sql`](../../complete_schema.sql) | 001 + 002 + 003 + 004 (full canonical schema) |
| [`supabase_schema.sql`](../../supabase_schema.sql) | 001 + 003 + 004 (canonical schema) |
| [`create_orders_tables.sql`](../../create_orders_tables.sql) | 003 (canonical `orders`/`order_items`) |
| [`create_coupons_table.sql`](../../create_coupons_table.sql) | 003 (canonical `coupons`/`coupon_usage`) |
| [`create_whatsapp_auth_tables.sql`](../../create_whatsapp_auth_tables.sql) | 004 (`whatsapp_otps` + `profiles` additions) |
| [`create_whatsapp_messages_table.sql`](../../create_whatsapp_messages_table.sql) | 004 (`whatsapp_messages`) |
| [`create_account_deletion_table.sql`](../../create_account_deletion_table.sql) | 004 (`account_deletion_requests`) |
| [`provision_admin.sql`](../../provision_admin.sql) | 004 (`profiles`/`admin_roles`/`admin_user_roles`) |
| [`enable_realtime_for_catalog.sql`](../../enable_realtime_for_catalog.sql) | Not superseded (Realtime config, not schema) — keep, but re-run only after this set is applied |
| [`relax_rls.sql`](../../relax_rls.sql) | 005 (canonical RLS policies — do NOT relax) |
| [`fix_auth_trigger.sql`](../../fix_auth_trigger.sql) | 004 (`profiles` + `is_admin()`); the auth-trigger itself may still be needed — verify after applying this set |
| [`fix_coupons_rls.sql`](../../fix_coupons_rls.sql) | 005 (canonical coupons RLS) |
| [`fix_foreign_key.sql`](../../fix_foreign_key.sql) | 003 (canonical `order_items.product_id` FK) |
| [`fix_orders_rls.sql`](../../fix_orders_rls.sql) | 005 (canonical orders RLS) |
| [`review_storage_setup.sql`](../../review_storage_setup.sql) | Not superseded (Storage bucket config, not schema) — keep |
| [`seed.sql`](../../seed.sql) | Not superseded (seed data) — re-run only against the canonical schema after column-name reconciliation |
| [`seed_orders.sql`](../../seed_orders.sql) | Not superseded (seed data) — re-run only after reconciling column names with canonical `orders` |
| [`seed_reviews.sql`](../../seed_reviews.sql) | Not superseded (seed data) — re-run only against `product_reviews` (canonical name) |

### `migrations/` folder files (superseded)

| Legacy file | Superseded by |
|-------------|---------------|
| [`migrations/add_checkout_tracking_columns.sql`](../add_checkout_tracking_columns.sql) | 003 (tracking columns folded into canonical `orders`) |
| [`migrations/create_payments_table.sql`](../create_payments_table.sql) | 003 (canonical `payments`) |

> **NOTE:** Once this migration set is applied, do **NOT** re-run any of the
> superseded schema/RLS/FK files listed above. Doing so may re-introduce the
> conflicting shapes, duplicate policies, or dropped columns that this set
> was created to resolve. The seed files (`seed*.sql`) are data, not schema,
> and may be re-run **only after** their column names are reconciled with the
> canonical schema (e.g. `reviews` → `product_reviews`, `user_id` →
> `customer_id`).

---

## Design Principles Followed (plan §4.1)

1. **Single source of truth** — one canonical shape per entity.
2. **Consistent naming** — snake_case, `id` UUID PKs.
3. **Referential integrity** — FKs with `ON DELETE` cascade/restrict/set null
   chosen per entity lifecycle.
4. **RLS by default** — every table has RLS enabled in file 005.
5. **JSONB for flexible content** — `pdp_config`, `shipping_address`,
   `tracking_history`, `product_details`, `raw_payload` — each with a
   `COMMENT` documenting the expected JSON shape.

---

## Assumptions (where the plan was ambiguous)

1. **`product_ingredients`, `product_trust_badges`, `product_faqs`,
   `product_process_steps`** are not explicitly listed as separate tables in
   plan §4.2 (the plan folds some into `pdp_config` JSONB and mentions
   `trust_badges`/`process_steps` as standalone). This set creates them as
   **per-product** normalized tables (`product_` prefix) to support structured
   admin CRUD while keeping `products.pdp_config` JSONB as the frontend
   rendering source of truth. The plan's standalone `trust_badges` /
   `process_steps` (global, non-product-scoped) are represented here scoped to
   a product; a global variant can be added in a later phase if needed.
2. **`profiles.admin_role`** is added alongside the `admin_roles` /
   `admin_user_roles` join tables to bridge the existing binary `is_admin()`
   pattern with the granular RBAC proposed in plan §5.4. `is_admin()` continues
   to check the coarse `profiles.role` for backward compatibility.
3. **`order_items`, `product_images`, `combo_items`, `inventory_logs`,
   `whatsapp_messages`, `whatsapp_otps`, `account_deletion_requests`,
   `newsletter_subscribers`, `product_trust_badges` (sort_order-only tables)**
   — the plan omits `updated_at` on some of these; this set adds `created_at`
   everywhere and `updated_at` only where mutation tracking is meaningful.
4. **`reviews` compatibility VIEW** is read-only and selects all columns from
   `product_reviews`; it does not expose an `INSTEAD OF` insert trigger. All
   writes must target `product_reviews`.
5. **Realtime** (`enable_realtime_for_catalog.sql`) and **Storage**
   (`review_storage_setup.sql`) are infrastructure config, not schema, and are
   intentionally not duplicated here.
