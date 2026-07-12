# Swadyum V1 — Gated Checklist

Work **top to bottom, one task at a time**. Finish every "Done when" box before moving on.
Sizing assumes ~3–4 hrs/day. Tasks marked ⏳(multi-day) may span 2–3 sittings.

Legend: `[ ]` todo · `[x]` done · **Why** (mindset/impact) · **Do** (steps) · **Done when** (acceptance)

---

## PHASE 0 — Foundations & safety (Days 1–3)

### Task 1 — Rotate the leaked DB password & move secrets to env 🔒
**Why:** Your Postgres password is hardcoded in `execute_sql.cjs` (and committed to git). Anyone with the repo can read/write your entire database. This must be closed before launch.
**Do:**
1. Supabase → Project Settings → Database → **Reset database password**.
2. Update the `*.cjs` helper scripts to read `process.env.DATABASE_URL` instead of a hardcoded string.
3. Put the new URL in `.env.local` (already git-ignored) and delete the hardcoded string from all committed files.
4. Rotate the Supabase **service-role key** too (Settings → API) and update any function secrets that used the old one.
**Done when:** a repo-wide search for the old password string returns nothing; scripts still run using the `DATABASE_URL` env var; new password confirmed working.

### Task 2 — Make login WhatsApp-OTP-only (remove fake mockDb auth)
**Why:** `LoginPage.jsx` accepts a hardcoded email/password (`mockDb`). It's not real auth and is a security/UX liability. WhatsApp OTP (already working) is your real login.
**Do:**
1. Point the header "My account" + any "Login" links to open the WhatsApp OTP modal (or `/login` → the modal), not the mock email form.
2. Remove/redirect `LoginPage`, `SignupPage`, `ForgotPasswordPage` mock flows (or hide them).
3. Ensure logged-out users hitting `/account` or checkout are prompted with the WhatsApp modal.
**Done when:** No path logs a user in without a real WhatsApp OTP; no reference to `mockDb.loginCustomer` remains in active routes.

### Task 3 — Verify Razorpay LIVE end-to-end 💳
**Why:** Real money must work before anything else. Frontend already calls the `razorpay` edge function; we must confirm live keys + signature verification + webhook.
**Do:**
1. Set live secrets on the Supabase `razorpay` function: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
2. Set the live `VITE_RAZORPAY_KEY_ID` (public) for the frontend checkout script.
3. Configure the Razorpay **webhook** URL → your webhook function; enable `payment.captured`.
4. Place a real **₹1 test order**, confirm: order row created, `status → Paid`, ThankYou page shows it, refund the ₹1.
**Done when:** A live prepaid order completes, DB shows `Paid`, and the webhook fired.

### Task 4 — Verify order → fulfillment path 📦
**Why:** Orders must actually reach you/Shiprocket. Decide automated vs manual for launch.
**Do (pick one):**
- **A. Shiprocket automated:** set `SHIPROCKET_EMAIL/PASSWORD/PICKUP_LOCATION` on `shiprocket-sync`; place a test order; confirm a Shiprocket order + AWB is created.
- **B. Manual for first orders (fastest to launch):** ensure every paid/COD order emails/WhatsApps you + shows in an admin/orders list; you create shipments by hand until volume grows.
**Done when:** A test order reliably notifies you with all details needed to dispatch (name, address, items, phone), by your chosen method.

---

## PHASE 1 — Trust & content (Days 4–7)

### Task 5 — Real product photos (replace all stock/competitor-label images) ⏳
**Why:** #1 trust + IP risk. A personal brand cannot sell on stock photos showing *other* brands' jars. This single change most affects conversion.
**Do:**
1. Shoot each SKU on one consistent warm backdrop (terracotta plate, mustard seeds, dried chillies — like your good hero shot). 3–5 angles each.
2. Compress to WebP (~150–250 KB), name consistently, upload to `product_images` (set `is_primary`, `display_order`).
3. Remove every stock image that shows a competing brand name.
**Done when:** Every product + combo shows your own consistent photography; zero competitor labels anywhere.

### Task 6 — Reconcile the catalog (dedupe + single source of truth)
**Why:** `mango-pickle` had each variant row **twice**; prices/weights must reconcile across Home, Shop, PDP, Cart. Inconsistent data reads as sloppy/untrustworthy.
**Do:**
1. Remove duplicate `product_variants` rows (keep one per weight per product).
2. Finalize the exact SKU list, names, weights, prices, MRP — one source (DB).
3. Spot-check the same product on Home, Shop, PDP, Cart — identical name/price/image.
**Done when:** No duplicate variants; product facts match on every surface.

### Task 7 — Honest stats pass (kill inflated/placeholder numbers)
**Why:** "10,000+ / 50,000+" on a small-batch brand reads as fake and *lowers* trust. Small, specific, real numbers convert better.
**Do:** Replace every inflated/placeholder stat site-wide with real ones (e.g. "100+ families across Bihar, Delhi & beyond"). Reconcile review counts.
**Done when:** Every number on the site is real and consistent.

### Task 8 — Fill remaining product content (like we did for mango) ⏳
**Why:** Thin PDPs don't convert. Each product needs the same depth as mango (story, named ingredients, taste, FAQ).
**Do:** For each remaining SKU, write `description`, `short_description`, expand `pure_ingredients`, and populate `pdp_config` (taste_profile, tabs incl. shelf_life, faq). Keep the light-Hinglish voice.
**Done when:** Every product page renders rich, product-specific content (no generic defaults).

### Task 9 — Real About/founder content
**Why:** DESIGN.md flags a placeholder founder ("Nora Bell"). Placeholder identity = "unfinished template."
**Do:** Replace with the real (or intentionally unnamed-but-warm) Ara/Bhojpur family story; confirm all About copy is final.
**Done when:** No placeholder names/story remain on About.

---

## PHASE 2 — UI polish (Days 8–9)
See [`UI-ENHANCEMENTS.md`](./UI-ENHANCEMENTS.md) for the detailed designer notes; tasks below are the execution order.

### Task 10 — Global consistency pass (tokens, type, buttons)
**Why:** A pro site feels *one system*. Fix the Poppins/Fraunces font mismatch, enforce the 3-tier button system everywhere, unify spacing/radius/shadow via tokens.
**Done when:** One heading font, one button hierarchy, consistent spacing across all pages.

### Task 11 — Homepage + product-grid card polish
**Why:** The homepage and shop grid are the first impression and the browse funnel.
**Done when:** Bento-style flavour grid, consistent cards, clear CTAs, mobile-swipeable where noted.

### Task 12 — Cart drawer + checkout UX polish
**Why:** This is where money is won/lost. Reduce friction, large tap targets, clear totals.
**Done when:** Cart + checkout are clean, single-column on mobile, error states clear.

### Task 13 — Loading skeletons, empty states, 404
**Why:** Perceived speed + polish. Blank flashes read as "broken."
**Done when:** Skeletons on data loads, friendly empty cart/search, branded 404.

---

## PHASE 3 — SEO & performance (Days 10–12)
See [`SEO-PERFORMANCE.md`](./SEO-PERFORMANCE.md) for specifics.

### Task 14 — Per-page meta + Open Graph / Twitter tags
**Why:** Every page currently shares one title/description; social shares have no preview image. Kills discoverability + share CTR.
**Done when:** Each route (and each product) has a unique `<title>`, description, and OG/Twitter image.

### Task 15 — Structured data (JSON-LD)
**Why:** Product/Organization/Breadcrumb schema → rich results (price, rating) in Google.
**Done when:** Valid JSON-LD on product pages + site-wide Organization; passes Rich Results Test.

### Task 16 — robots.txt + sitemap.xml
**Done when:** `/robots.txt` and `/sitemap.xml` served; submitted in Google Search Console.

### Task 17 — Performance pass
**Why:** Speed = ranking + conversion, especially mobile. Remove unused Fraunces font, lazy-load images, code-split the 770 KB bundle.
**Done when:** Lighthouse mobile ≥ 90 perf / ≥ 95 SEO; no unused fonts.

### Task 18 — Analytics + Pixel
**Done when:** GA4 (or Plausible) firing pageviews + purchase events; Meta Pixel installed for future ads.

---

## PHASE 4 — QA & launch (Days 13–14)

### Task 19 — Full end-to-end order test (prepaid + COD) on live
**Done when:** Both a live prepaid and a COD order complete, notify you, and appear correctly; refund the test prepaid.

### Task 20 — Legal, policy, contact, WhatsApp final check
**Done when:** All policy pages linked in footer, contact form + WhatsApp button work, business details correct.

### Task 21 — Domain → Vercel + HTTPS
**Done when:** `swadyum.store` (and `www`) resolve to Vercel over HTTPS; old preview URLs redirect.

### Task 22 — Final smoke test + go live + monitor
**Do:** Cross-device pass (Android/iPhone/desktop), check console for errors, set up basic error alerting, announce.
**Done when:** Live site passes a full manual walkthrough with no console errors; you're watching orders come in.

---

### Progress
- Phase 0: ☐☐☐☐  Phase 1: ☐☐☐☐☐  Phase 2: ☐☐☐☐  Phase 3: ☐☐☐☐☐  Phase 4: ☐☐☐☐
