# Swadyum — SEO, Performance & Launch Technicals

Current state: `index.html` has a single static title + description + theme-color + favicon. **Missing:** per-page meta, Open Graph/Twitter tags, sitemap, robots, structured data. Bundle ~770 KB JS. Unused **Fraunces** font loaded.

## SEO (Tasks 14–16)

### Per-page meta (Task 14)
- SPA needs a head manager. Add **`react-helmet-async`** (or `@vueuse/head` equivalent).
- Give each route a unique `<title>` + `<meta description>`:
  - Home: "Swadyum — Authentic Bihari Pickles, Sun-Cured & Small Batch"
  - Product: "{Product Name} — Buy Online | Swadyum" + product short description
  - Shop/About/Recipe/Contact: their own.
- **Open Graph + Twitter** on every page: `og:title`, `og:description`, `og:image` (a real product/brand image, 1200×630), `og:type`, `og:url`, `twitter:card=summary_large_image`. Without these, WhatsApp/Instagram/FB shares show no preview → near-zero share CTR.
- Canonical URLs per page.

### Structured data — JSON-LD (Task 15)
- **Product** schema on PDPs: name, image, description, brand, offers (price, priceCurrency INR, availability), aggregateRating **only if real reviews exist**.
- **Organization** schema site-wide: name, logo, url, sameAs (socials), contactPoint (WhatsApp).
- **BreadcrumbList** on PDPs (Home › Shop › Product).
- Validate with Google Rich Results Test.

### Crawlability (Task 16)
- `public/robots.txt`: allow all, point to sitemap.
- `public/sitemap.xml`: all static routes + every product URL. Regenerate when SKUs change.
- Google Search Console: verify domain, submit sitemap.
- Ensure product URLs are clean (`/product/{slug}`) — already are.

## Performance (Task 17)
- **Remove the unused Fraunces font `<link>`** (or switch headings to it and drop Poppins) — one less render-blocking download.
- **Images:** all WebP, sized to display, `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP hero image, width/height set to avoid layout shift.
- **Code-split** the 770 KB bundle: lazy-load routes with `React.lazy` + `Suspense` (Checkout, Account, Legal don't need to be in the first load). Cuts initial JS a lot.
- Preconnect to Supabase + fonts (fonts already preconnected).
- Target: **Lighthouse mobile ≥ 90 perf, ≥ 95 SEO, ≥ 95 best-practices/accessibility.**

## Analytics & pixels (Task 18)
- **GA4** (or Plausible for privacy-friendly) — pageviews + `add_to_cart`, `begin_checkout`, `purchase` events.
- **Meta Pixel** — install now (even pre-ads) so you build retargeting audiences from day one.
- Fire `purchase` on the ThankYou page with order value.

## Deployment & ops (Tasks 21–22)
- **Vercel:** connect the repo, set all `VITE_*` env vars in the Vercel dashboard (not committed). Confirm SPA rewrite (already in `vercel.json`).
- **Supabase function secrets:** Razorpay live keys, webhook secret, Shiprocket creds, WhatsApp token, `SUPABASE_JWT_SECRET` — all set on the functions.
- **Domain:** point `swadyum.store` + `www` DNS to Vercel; force HTTPS; set primary + redirect.
- **Webhooks:** Razorpay webhook → Supabase function URL (production).
- **Monitoring:** add basic error tracking (Sentry free tier or Vercel logs); watch Supabase function logs for the first orders.
- **Backups:** confirm Supabase daily backups are on.

## Pre-launch SEO/QA checklist
- [ ] Every page has a unique title + description + OG image
- [ ] JSON-LD valid (Rich Results Test)
- [ ] robots.txt + sitemap.xml live and submitted
- [ ] Lighthouse mobile ≥ 90/95/95
- [ ] Unused font removed; images lazy + sized
- [ ] GA4 + Pixel firing purchase events
- [ ] All env/secrets set in Vercel + Supabase (nothing hardcoded)
- [ ] Live prepaid + COD order tested end-to-end
