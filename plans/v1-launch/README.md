# Swadyum — V1 Launch Plan

**Goal:** A fully functional, trustworthy, SEO-ready store that can comfortably handle **3–4 orders/day**, ready to deploy on `swadyum.store`.

**Pace:** ~3–4 hrs/day → **~2 week** launch window.
**How to use this:** The full map lives in [`CHECKLIST.md`](./CHECKLIST.md), but work **one task at a time, in order**. Do not start the next task until the current one's "Done when" boxes are all ticked. Ask Claude to "reveal the next task" when you finish one.

---

## Locked decisions (from planning)
| Area | Decision |
|---|---|
| Production backend | **Supabase Edge Functions** (frontend already calls them; `server.js` is legacy/dev-only) |
| Payments | **Razorpay — LIVE keys + KYC done** |
| Login | **WhatsApp OTP only** (email/password `mockDb` to be removed) |
| Hosting | **Vercel** (static frontend) + Supabase (DB + functions) |
| Already ready | Domain `swadyum.store`, business bank account, policy text |
| Biggest content blocker | **Real product photos** (still on stock/competitor-label images) |

---

## Current state (what's already built ✅ vs. open ⚠️)

**✅ Built**
- Frontend (React 19 + Vite): Home, Shop, Category, Product page (redesigned + mango content done), Cart, Checkout, About/Recipe/Contact/ThankYou (redesigned), Account, Address book, Reviews, all Legal pages, Header/Footer, design-system tokens.
- WhatsApp OTP auth (fixed & working).
- Checkout → Supabase `razorpay` edge function (prepaid) + COD path.
- Supabase Edge Functions: `razorpay`, `shiprocket-sync`, `whatsapp-auth`, `fastrr-checkout`, webhooks, cleanup cron.

**⚠️ Open / risks**
1. **Security:** DB password hardcoded in `execute_sql.cjs` (committed) → rotate + move to env.
2. **Fake login:** `LoginPage.jsx` uses `mockDb` (hardcoded email/password) → remove, WhatsApp-only.
3. **Live payment not yet verified end-to-end** with real keys.
4. **Fulfillment path** (Shiprocket) not verified with live creds (or choose manual for first orders).
5. **Product photos** = stock images, some with competitor brand names on labels (trust/IP risk).
6. **Catalog hygiene:** duplicate variant rows; thin content on non-mango products; inflated stats in places.
7. **SEO greenfield:** single static `<title>`/description, **no OG/Twitter tags, no per-page meta, no sitemap/robots, no structured data**; unused Fraunces font loaded.

---

## The 5 phases
0. **Foundations & safety** — secure secrets, real login, verify money + fulfillment.
1. **Trust & content** — real photos, honest data, per-product content.
2. **UI polish** — professional consistency pass across the whole site.
3. **SEO & performance** — meta, structured data, sitemap, speed, analytics.
4. **QA & launch** — end-to-end order tests, domain, go live.

Supporting docs:
- [`CHECKLIST.md`](./CHECKLIST.md) — the gated, numbered task list (the thing you work from).
- [`UI-ENHANCEMENTS.md`](./UI-ENHANCEMENTS.md) — designer-level UI improvements.
- [`SEO-PERFORMANCE.md`](./SEO-PERFORMANCE.md) — SEO + speed + launch technicals.
