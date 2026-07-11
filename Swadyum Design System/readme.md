# Swadyum Design System

Swadyum ("स्वाद यम" — Taste of Bihar) is a D2C food brand selling traditional, sun-cured Bihari pickles (achaar) and heritage condiments online, shipping pan-India. The brand story centers on Ara, Bhojpur, Bihar: small-batch, clay-martaban-aged pickles made with cold-pressed mustard oil, sun-cured spices, and no artificial preservatives — positioned as a "luxury culinary heritage" brand, not a mass-market pickle jar.

## Sources

- **Codebase** (mounted, read-only): `Swadyum website/` — a Vite + React storefront (`src/*.jsx` + matching `*.css`, one pair per page/section) plus a `frontend/` (Next.js) and `admin/` (Vite) folder for a customer-facing site rebuild and an internal admin panel. This design system was built by reading the **Vite React storefront** (`Swadyum website/src/`), which is the fullest, most finished implementation of the brand's live visual language. `Swadyum website/frontend` and `Swadyum website/admin` exist but were not the primary source — flag if you want those explored too.
- **Uploaded file**: `uploads/Logo-01.png` — the current circular Swadyum logo lockup (green, scalloped-seal shape, Hindi "स्वाद" + "YUM" + "Taste of Bihar").
- No Figma file or brand guideline PDF was provided.

## Products / surfaces represented

1. **Swadyum storefront** (marketing site + shop + PDP + cart + account) — the one UI kit built here. Pages: Home, Shop (PLP), Product Detail (PDP), Cart drawer, WhatsApp OTP login, About, Account. Built in React + Framer Motion, plain CSS custom properties (no Tailwind, no CSS-in-JS, no component library like MUI/shadcn).
2. **Admin panel** (`Swadyum website/admin`) — not explored for this pass; flag if needed.

## A note on the color tokens' names

The CSS variable names in the source (`--color-chili`, `--color-mango`, `--color-clay`, `--color-leaf`) are legacy from an earlier red/terracotta "chili & spice" palette. The comment in `index.css` itself says the values were repointed to a green identity ("Logo Green Theme") when the brand adopted its current circular green logo, but the variable *names* were never renamed. This design system renames the tokens to their current meaning (`--color-primary`, `--color-accent`, etc. in `tokens/colors.css`) rather than perpetuating the mismatched names — see that file for the literal → semantic mapping.

## A note on the product photography

Several images in `public/` (`prod_mango.webp`, `editorial_spoon.webp`, and similar "jar on a table" shots) are AI-generated stock photography placeholders — they show fictional labels like **"Anandi's Home Kitchen"** and **"Dadi's Recipe"**, not real Swadyum packaging. Treat these as generic pickle-jar/ingredient imagery for layout purposes only, never as the real product label. The one real brand asset is the logo. If real product photography exists, ask the user to supply it.

## Index

- `styles.css` — root stylesheet; imports everything under `tokens/`.
- `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css` — design tokens (see Visual Foundations below).
- `assets/logo/` — logo mark (uploaded PNG + site webp) and favicon.
- `assets/imagery/` — photography pulled from the site (`public/*.webp`): hero banners, category shots, product jars, process/lifestyle images. See note above on placeholder product photos.
- `components/` — reusable UI primitives, grouped by concern. See "Components" below.
- `ui_kits/storefront/` — click-through recreation of the Swadyum storefront (home, shop, PDP, cart, login).
- `guidelines/` — specimen cards feeding the Design System tab.
- `SKILL.md` — portable skill file for use in Claude Code.

## Components built

Grouped by concern — no Figma/component-library source existed, so this is a standard e‑commerce set sized to what the storefront actually uses (see each component's directory for the card + prompt):

- `components/core/` — Button, Badge, IconButton, Chip
- `components/forms/` — Input, Select, QuantitySelector, OtpInput, Checkbox
- `components/commerce/` — ProductCard, CategoryCard, StarRating, PriceBlock
- `components/feedback/` — Accordion, Toast, Modal
- `components/layout/` — SectionHeading, Divider (Madhubani motif, ported from the site's own `MadhubaniDivider.jsx`)

### Intentional additions
- **IconButton** — the site repeats a circular 44×44 icon-button pattern (header actions, footer social, cart) without ever naming it as a component; extracted as one for reuse.
- **Chip** — the trust-bar / benefit items are ad hoc `<div>`s in the source; promoted to a small reusable primitive since it recurs across Home, PDP and Cart.
- **Toast** — the site has one hard-coded toast (`.toast-notification` in `App.css`); generalized into a reusable component since any storefront needs one.

---

## Content Fundamentals

**Voice**: warm, heritage-forward, slightly indulgent/"luxury" — but never fussy. Sentences lean short and declarative, then land on one lyrical flourish. From the source copy:
- "Taste the *Heritage.* Feel the *Tradition.*"
- "We don't do mass production. We don't use chemical vinegars or artificial preservatives."
- "This isn't just about food; it's about curating a luxury culinary experience that stays fiercely loyal to its roots."
- "Swadyum is a family-run brand."

**Point of view**: mostly **"we"** (the maker) describing "our" process, addressing the reader as **"you"**/"your table" — a maker-to-guest register, not a corporate "I". CTAs are imperative and short: "Shop Now", "Our Story", "Explore Gift Packs".

**Casing**: Sentence case for headlines and body copy (`Find Your Favourite`, `We do not buy from mass producers or factories.`). Section eyebrows/kickers are the one ALL-CAPS exception, always small and letter-spaced (`OUR FLAVOURS`, `EXPLORE BY FLAVOUR`). Buttons are Title Case (`Add to Cart`, `Shop Now`).

**Italics as emphasis**: headline copy repeatedly italicizes the emotional word inside an otherwise plain headline — `Meet the <em>4 Flavours</em>`, `The Taste of Ara, <em>Bhojpur</em>`, `Sun-Cured <em>Spices.</em> Timeless <em>Flavour.</em>` — rendered in the primary green, at a lighter weight than the rest of the headline. This is a signature move; use it instead of bolding or coloring whole headlines.

**Numbers & proof**: leans on concrete stats and place names for credibility — "200+ families", "10,000+ Happy Customers", "Ara, Bhojpur, Bihar", "FSSAI Approved" — rather than vague superlatives alone.

**Emoji**: used, but sparingly and functionally — mostly as small inline glyphs next to micro-copy in transactional UI (cart/PDP): 🚚 delivery ETA, 🔒 secure checkout, 🍃 natural, 🔄 returns, 🎉 in the promo marquee, 🌶️ spice-level picker, 🇮🇳 phone-country prefix. Emoji never appear in headlines, section titles, or brand voice copy — only in small utilitarian UI strings. Don't invent new emoji uses beyond this transactional-UI pattern.

**Vibe**: heritage/artisanal + D2C-modern. Think "grandmother's recipe" sincerity wrapped in a clean, confidently modern e-commerce shell (rounded pill buttons, soft shadows, motion) — not rustic/handwritten, not corporate/clinical.

---

## Visual Foundations

**Color**: Two-tone brand green (`--color-primary` deep forest green `#0a5a32`, `--color-secondary` a light lime `#c8dca0`) borrowed directly from the current logo, plus one warm amber accent (`#e8a83a`) reserved for "spicy"/attention badges. Backgrounds are an extremely pale green-tinted off-white (`#f4f8f5`), never pure white except for cards/surfaces. Text ink is a near-black with a green undertone (`#112018`), not pure black. No purple, no blue — keep gradients out of the palette entirely (see below).

**Type**: Two families only. **Poppins** (headings — geometric, confident, used at 700/800 weight) and **Plus Jakarta Sans** (body/UI — humanist, used at 400–700). Headline italics use Poppins italic at a *lighter* weight (400) in the primary green as the signature emphasis device (see Content Fundamentals). Section eyebrows are Plus Jakarta Sans, 12px, 700 weight, 3px letter-spacing, uppercase, primary green.

**Spacing**: 4px base scale (`--space-1`…`--space-24`, i.e. 4/8/12/16/20/24/32/40/48/64/80/96px). Section padding is generous — `--space-24` (96px) top/bottom on desktop, dropping to `--space-16`/`--space-12` on mobile.

**Backgrounds**: Mostly flat tinted panels (`--color-bg`, `--color-cream`), not imagery-first. Where photography *is* full-bleed (hero banners), it's always behind a strong left-to-right or top-to-bottom **scrim gradient** fading from the cream background color to transparent — text sits in the opaque zone, image breathes on the other side. No repeating textures/patterns; no hand-drawn illustration style except one: thin-line "Madhubani" (Mithila folk-art) motifs — lotus, fish-pair, sun, floral vine — used as tiny, sparse section dividers (~40px tall, 30% opacity strokes), a deliberate nod to Bihar's regional art tradition. This is the brand's one illustrated flourish; don't extend it into icons or heavier illustration.

**Animation**: Motion is subtle and consistent — Framer Motion fade+rise-ins on scroll (`opacity 0→1`, `y: 20-30px → 0`), staggered by ~0.06–0.1s per grid item, using an ease-out curve (`cubic-bezier(0.16, 1, 0.3, 1)`), 250–600ms. Carousels/hero slides crossfade with a slight scale (1.05→1). No bounce/spring except the cart-count badge (a snappy spring pop) and the OTP/coupon success states. Nothing loops indefinitely except the header announcement marquee and the trust-bar logo scroll (linear, slow, 20-40s).

**Hover states**: Buttons lift (`translateY(-2px)`) and deepen to the darker green, with a subtle diagonal white-sheen overlay fading in. Cards lift more (`translateY(-6px)`) and gain `--shadow-card-hover`, border fading to transparent. Links/nav underline in from center (`scaleX(0→1)`). Icon buttons get a soft tinted-green background wash. Secondary/outline buttons invert to solid ink on hover.

**Press states**: Buttons return to `translateY(0)` on `:active`; the "Add to cart" button on PDP does a `whileTap={{scale:0.96}}` micro-shrink.

**Borders**: 1px, very light green-gray (`--color-border` `#e1ebe4`), used to separate cards/inputs from the cream background rather than shadows alone. Focus rings are a solid 2–3px primary-green outline with offset (`outline-offset: 2-3px`) — accessible, never removed.

**Shadows**: Soft, warm-tinted (dark ink at low opacity, not pure black), used sparingly — mostly on hover states and floating drawers/modals, not on resting cards (resting cards rely on a border only). `--shadow-card-hover` is tinted primary-green for product cards specifically.

**Corner radii**: Buttons and pills are fully rounded (`--radius-full`). Cards use a generous `--radius-xl` (24px). Inputs/small controls use `--radius-md` (10px). Nothing is sharp-cornered except the hero hairline dividers.

**Cards**: White surface, 1px light-green border, `--radius-xl`, no shadow at rest; on hover the border disappears and a soft green-tinted shadow + lift takes over. Product images sit in a `--color-cream` letterboxed well above the info block, never edge-to-edge without a background.

**Transparency & blur**: Used exactly twice, purposefully — the sticky header gets `backdrop-filter: blur(14px)` over a translucent cream once scrolled (so content shows through faintly), and modal/drawer overlays use a translucent dark scrim with a light blur. Not used decoratively elsewhere.

**Imagery color vibe**: Warm, golden-hour toned — sunset skies, terracotta clay pots, mustard-yellow spices — consistent with "sun-cured" positioning. Product jar photography sits on clean white/neutral backgrounds by contrast. No black-and-white, no cool tones, no heavy grain/filter — imagery reads as bright, warm, and appetizing.

**Layout rules**: Header is fixed with two stacked bars (a 36px dark ink utility bar with contact/social/announcement marquee, then a 72px logo+nav bar that goes translucent-blurred on scroll). Content max-width is 1280px, centered, with 24–48px side padding. Section rhythm alternates a plain cream section with a white-card-grid section — the design uses at most the two background tones (cream page bg, white cards) rather than many block colors.

---

## Iconography

No icon font and no external icon library (no Lucide/Heroicons/Font Awesome import). Every icon in the codebase is a **hand-authored inline SVG**, consistently: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap/Linejoin="round"` — i.e. the Feather-icons stroke style, redrawn inline rather than imported from that library. Sizes used: 14–16px inline (ratings/tabs), 20–22px UI actions (header/footer/trust icons), 28–32px feature icons (About page values).

Two exceptions:
1. `public/icons.svg` is a `<symbol>` sprite of **generic developer-tool social icons** (Bluesky, Discord, GitHub, X, "documentation") in an unrelated purple accent color — this is boilerplate left over from a starter template, not part of the Swadyum brand system. Not carried into this design system.
2. **Emoji** are used as lightweight icons in transactional micro-copy only (see Content Fundamentals) — 🚚 🔒 🍃 🔄 🎉 🌶️ 🇮🇳 — never as the primary icon for a nav/action item.

For this design system, `components/core/Icon` families are not pre-built as a set; instead each component that needs a glyph inlines an SVG matching the Feather-style rules above, exactly as the source does. If you need an icon not already used in the source, draw it in that same stroke style (24px viewBox, 2px round stroke) rather than mixing in a filled or duotone style.

---

## Caveats / help wanted

- No design tokens for dark mode, RTL, or a documented type scale beyond what's in `index.css` — only what the CSS actually defines is captured here.
- `Swadyum website/frontend` (Next.js) and `Swadyum website/admin` were not explored — say the word if you'd like a second UI kit built from either.
- Fonts are loaded live from Google Fonts (no local `.ttf`/`.woff2` files existed in the repo) — this is faithful to the source, not a substitution.
- The core product photography in `public/` is AI-stock placeholder art with fictional labels (see note above) — real packaging photography would meaningfully improve the PDP/product-card specimens.
