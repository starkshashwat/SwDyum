# Swadyum — UI/UX Enhancement Notes (designer pass)

The PDP and About/Recipe/Contact/ThankYou pages are already redesigned to a premium-editorial system. These notes bring the **rest of the site** up to the same bar and make it feel designed by one hand.

## 1. Design-system hygiene (do first — Task 10)
- **Font mismatch:** `index.html` loads **Fraunces + Plus Jakarta**, but `index.css` uses **Poppins** for headings. Pick one heading font and use it everywhere (remove the other's `<link>` to save a font download). Recommendation: keep **Poppins** (already wired) or intentionally switch headings to **Fraunces** for a more editorial feel — but only one.
- **Button system:** enforce the 3 tiers already defined (`.btn-primary` / `.btn-secondary` / `.btn-text`). Audit Home, Shop, Cart, Checkout, Account for one-off button styles and replace them.
- **Tokens:** spacing, radius, shadow, color must come from CSS variables — no hardcoded hex/px in components. Grep for `#` and stray `px` in page CSS.
- **One accent discipline:** green is primary; use mustard/amber sparingly for highlights (prices, savings, stars). Avoid rainbow badges.

## 2. Typography & rhythm
- Establish a clear scale: H1 (hero) → H2 (section) → H3 (card) → body → small. Don't let two sizes look nearly identical.
- Body line-height 1.6–1.7; max text width ~60ch for readability.
- Tighten letter-spacing on large headings (−0.02em), widen it on small uppercase eyebrows.
- Numbers (price, savings) in a slightly heavier weight to anchor the eye.

## 3. Homepage
- Lead with **one flagship product + real photo**, a specific trust line (real numbers), and one primary CTA.
- Replace any oversized 4-across grid with a **bento "Meet the flavours"** layout; on mobile make it a swipeable carousel.
- Keep the process/"Why Swadyum" section to 4 clean cards (2×2 on mobile), icons not emoji.
- Add a slim, honest trust strip (FSSAI, cold-pressed, small-batch, moisture-locked).

## 4. Product grid / cards (Shop, Related, Featured)
- Uniform card: square image, name, price + MRP + save badge, one hover lift. No fake star ratings unless real.
- Consistent image aspect ratio and object-fit across all cards (no letterboxing).
- "Add" affordance consistent (matches PDP button hierarchy).

## 5. Cart drawer & Checkout
- Cart: clear line items, qty steppers with 44px tap targets, subtotal + savings, one primary "Checkout" CTA, secondary "continue shopping".
- Checkout: **single column on mobile**, minimal fields, auto-detect pincode where possible, sticky order summary, visible trust (secure payment, COD, returns) near the pay button.
- Inline validation with friendly messages; never a dead-end.

## 6. Micro-interactions (restrained)
- `whileTap` scale on all buttons, hover lift on cards, smooth accordion, add-to-cart confirmation bounce (already on PDP — extend site-wide).
- Respect `prefers-reduced-motion` (already scaffolded).

## 7. States & polish
- **Loading:** skeletons for product grids, PDP, cart — not blank screens or "Loading…".
- **Empty:** friendly empty cart, empty search, no-reviews-yet.
- **Error/404:** branded 404 with a route back to Shop.
- **Toasts:** consistent success/error toast style.

## 8. Mobile-first (60%+ of traffic)
- Thumb-zone CTAs; sticky bottom add-to-cart on PDP (done) — verify on all product pages.
- Collapse nav to logo + hamburger + cart under 400px; test the WhatsApp login modal on small screens.
- Min 44px tap targets everywhere; test forms with the on-screen keyboard.

## 9. Accessibility (also helps SEO)
- Every image has meaningful `alt` (product name + context).
- Visible focus rings on all interactive elements (mostly done).
- Color contrast ≥ 4.5:1 for body text; check muted greens on cream.
- Buttons are real `<button>`/`<a>`, labelled for screen readers.

## 10. Brand motif (differentiation)
- Add restrained Madhubani-inspired line dividers/section separators in one accent color — used sparingly.
- Keep photography styled consistently (the same warm backdrop) as the visual signature.

### Priority order
Task 10 (system hygiene) → 11 (home + cards) → 12 (cart/checkout) → 13 (states/404). Everything else is incremental.
