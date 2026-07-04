# Swadyum.store — Design Audit, Brand System & Implementation Plan
**Prepared for:** Handoff to Antigravity (build agent)
**Brand:** Swadyum (स्वादयुम) — Authentic Bihari Pickles, D2C, custom Next.js/HTML
**Scope:** Max 4 hero products + 1–2 combo boxes. Fully personalised small-batch brand.
**Date:** June 2026

---

## 0. TL;DR for Shashwat

Site ka structure, copywriting aur funnel logic (hero → process → combo upsell → reviews → CTA) actually **achha hai** — ye 2026 D2C food-brand playbook ke saath align karta hai. Problem yeh hai ki **visual execution brand ke promise se match nahi karta**:

- Story kehti hai "handcrafted, personal, Bihar se" → but visuals kehte hain "generic Shopify template + dusre brands ki stock photos."
- "Authentic" ka sabse bada dushman hai: **fake-looking product photos + fake founder name + inflated/inconsistent stats.** Ek 4-product personal brand ko bilkul opposite direction mein jaana chahiye — chhota, real, specific, warm.

Niche poora system hai: audit → design direction → component-level implementation plan → priority roadmap. Ye Antigravity ko as-is de sakte ho.

---

## 1. CRITICAL ISSUES (P0 — Launch Blockers)

| # | Issue | Where seen | Why it matters |
|---|---|---|---|
| 1 | **Product images are stock photos with visible competing brand names** ("SWARNIM", "ACHARA", "THE SPICE HERITAGE", "DESI HARVEST" printed on jar labels) | Home "Find Your Favourite" grid, Shop grid, Bestsellers grid | Single biggest trust + IP-risk issue on the entire site. A personalised brand cannot sell someone else's product photos. Must be replaced before any traffic/ads go to this site. |
| 2 | **Founder identity placeholder not replaced** — "Nora Bell, Founder, Swadyum Foods" with a stock photo of an Indian woman in a saree, against a story rooted entirely in Patna/Bihar | About page | Reads as unfinished template text. Either use Shashwat's real founder name/story, or a real family member's name — never a placeholder. |
| 3 | **Sticky header overlaps/clips page content while scrolling** — headlines and price text are cut off behind the nav bar in multiple states | Seen in nearly every screenshot mid-scroll | This is a real CSS bug (z-index / scroll-margin), not just aesthetic — looks broken to any visitor who scrolls slowly. |
| 4 | **Footer brand mark is a blank white circle** (broken/missing image) | Footer, all pages | Looks like a failed image load — undermines "premium" positioning instantly. |
| 5 | **Inconsistent / inflated social proof numbers across sections** — "10,000+ happy customers" vs "50,000+ jars delivered," "95% repeat orders" in one screen vs "94%" in another, review counts (312, 187, 143, 208) that don't reconcile with "10,000+ families" | Hero trust line, Reviews section stat cards | For a declared max-4-product, personal small batch brand, big round numbers like 50,000 jars feel implausible and inconsistent numbers feel fabricated. This actively hurts authenticity — the opposite of the brand's stated promise. |
| 6 | **Catalog pretends to be bigger than it is** — Shop page header says "Showing 7 artisanal products" with filter pills for Mango / Garlic / Lemon / Green Chilli / Mixed / Gift Boxes, full search bar + sort dropdown + price range slider | Shop page | This is catalog UI built for a 50+ SKU store, bolted onto a 4-product brand. It dilutes the "small batch, made by hand" story instead of supporting it. |

**Bottom line:** none of this needs new "features" — it needs real photography, real numbers, and bug fixes. This is the highest-ROI work before any visual redesign.

---

## 2. SECONDARY ISSUES (P1 — Design Quality)

1. **No unified button system.** Counted 4 different CTA styles in use: white pill ("Shop Now"), solid green rectangle ("Add to Cart"), outlined pill ("View All Products"), tiny pill ("+ Add"). Needs one primary + one secondary button style, used consistently.
2. **Typography lacks a confident identity.** The cursive/script "kicker" labels (*Explore by Flavour*, *Our Process*, *Curated Collections*) look like a generic Canva-template font, and clash with the serif headlines. Nothing here currently reads as "bold."
3. **Story vs. visual disconnect.** Copy explicitly mentions Madhubani/Mithila painting motifs, earthen clay pots, rooftop sun-curing — none of this cultural visual language appears anywhere in the actual UI. Right now the site looks like a generic sage-green "organic wellness" template that could belong to any DTC brand in any country. This is the single biggest opportunity: lean into Bihar-specific visual identity instead of borrowing generic DTC visual codes.
4. **Color palette doesn't match the brand brief.** Despite the brand being built around *mustard, chili red, mango orange*, the dominant color across the site is sage/forest green, with gold used only as a thin accent. Green should become the minor accent; warm spice tones should lead.
5. **Data inconsistency between sections** — prices, weights and flavor names don't fully reconcile between Home hero, Home grid, Shop grid, and the combo box contents. Needs one single source of product data.
6. **Mobile experience not verified** — all captured screens are desktop. Given 60%+ of D2C food traffic in 2026 is mobile, and the explicit ask is mobile-first, this needs a dedicated pass (see Section 5).

---

## 3. WHAT'S ALREADY WORKING — KEEP THIS

- The **content architecture** is genuinely good: Hero → Trust strip → Best Sellers → Why Swadyum (process) → Combo upsell → Reviews/stats → Story-driven CTA → Footer. This funnel order matches what converts in 2026 food D2C.
- The **About page narrative arc** (Visionary message → Genesis timeline → Heritage formulas → Method steps → Purity guarantee → Mission/Vision → Cultural roots) is strong storytelling — it just needs real assets behind it.
- **Combo box mechanic** ("Bihari Heritage Box," "Spicy Duo" with Save ₹X badges) is a smart AOV lever for a 4-SKU brand — keep and expand this, don't remove it.
- Trust badges (FSSAI, 100% organic, no preservatives) are the right things to say for this category.

---

## 4. 2026 D2C / MOBILE COMMERCE TRENDS — WHAT TO BORROW

Research findings relevant to a small, personal, mobile-first food brand:

- **Mobile is the primary surface, not a shrink of desktop.** Design every screen mobile-first: thumb-zone CTAs, swipe gestures, sticky bottom add-to-cart bar on product pages.
- **Simplified choice architecture wins for small catalogs.** Big-catalog UI patterns (search bars, price sliders, 6+ filter pills) actively hurt a 4-product brand — they signal "I don't have much, so I'm dressing it up." Cut these.
- **Bento-grid layouts** (modular box grids) are replacing long stacked card lists for showcasing a small number of items — perfect fit for exactly 4 products + 1–2 combos.
- **Micro-interactions matter more than big animation.** A satisfying "add to cart" bounce, a subtle hover/tap state — these build subconscious trust; one heavy animation does not replace this.
- **Scrollytelling** (scroll-triggered reveal of the heritage/process story) fits the "Why Swadyum" and About narrative perfectly — but should be restrained (fade/slide-up only, not over-produced) so it stays fast on mobile data.
- **WhatsApp-first contact** is increasingly standard for small Indian D2C brands — more trusted than a generic contact form, and matches "personalised" positioning. Should be a persistent, visible channel, not buried in the Contact page.
- **Real, specific social proof beats big round numbers.** For a brand this size, "200+ families across Bihar, Delhi & Bengaluru" reads as more credible than "10,000+ happy customers."

---

## 5. DESIGN SYSTEM

### 5.1 Color Palette — move from "generic organic green" to "Bihar spice market"

Green should drop from primary to a minor accent. Lead with warm, saturated spice tones that actually match the brand brief (mustard, chili red, mango orange).

| Token | Hex (suggested) | Use |
|---|---|---|
| `--color-bg` | `#FBF5EA` | Page background (warm cream, not stark white) |
| `--color-ink` | `#241A14` | Primary text — warm near-black, not pure black |
| `--color-chili` | `#C1402B` | Primary brand color — CTAs, key accents, badges |
| `--color-mustard` | `#D99A1B` | Secondary accent — kickers, highlights, star ratings |
| `--color-mango` | `#E8762C` | Tertiary accent — hover states, small details |
| `--color-clay` | `#7C4A30` | Deep brown — footer background, secondary text on light |
| `--color-leaf` | `#4B6A3C` | Minor accent only (organic/leaf icons) — no longer dominant |
| `--color-card` | `#FFFFFF` | Card surfaces |
| `--color-border` | `#EDE2D0` | Subtle dividers |

### 5.2 Typography — drop the script font, get bolder

- **Display/headline font:** one confident serif with real weight contrast (e.g. Fraunces, Lora Bold, or Libre Caslon Display). Used for all H1/H2.
- **Body font:** a clean grotesk sans (Inter, General Sans, or similar) — current body text is fine, keep it.
- **Kicker/label font (replace immediately):** drop the cursive script ("Explore by Flavour" style). Replace with the sans font, small size, wide letter-spacing, uppercase, in `--color-chili` or `--color-mustard`. This alone will make the site feel more confident and less "template."
- **Scale:** mobile H1 ~32–36px / desktop H1 ~52–60px, with generous line-height on body (1.6) for readability on small screens.

### 5.3 Brand motif — the missing authenticity layer

The copy already references Madhubani/Mithila art and earthen pots — **put this in the UI, not just the text:**
- Thin SVG line-art dividers between sections using Madhubani motifs (sun, fish, peacock, simple botanical borders) in a single accent color — used sparingly as section separators, not decoration overload.
- A subtle hand-painted/brush-stroke texture behind the hero or section backgrounds (not a flat color block) to suggest "handmade," not "corporate."
- Jar photography styled consistently against the same warm backdrop (terracotta plate, mustard seeds, dried chilies) used in the current hero shot — that one image (Image 16) is actually good and should become the *template* for all four products, not the exception.

### 5.4 Component system — one CTA hierarchy

| Style | Use | Look |
|---|---|---|
| **Primary button** | Add to Cart, Shop Now, Buy combo | Solid `--color-chili`, white text, rounded-full, consistent padding across site |
| **Secondary button** | Our Story, View Details, Quick View | Outlined, `--color-ink` text, transparent fill |
| **Tertiary/text link** | "See all flavours," footer links | Underlined text only, no border/fill |

Remove the small pill "+Add" pattern, the all-white pill, and the plain rectangle — consolidate to the three above everywhere on the site.

---

## 6. INFORMATION ARCHITECTURE — RIGHTSIZE FOR 4 PRODUCTS

Current IA (search bar + sort + price slider + 6 category pills + "7 artisanal products") is built for a large catalog. New IA for a 4-SKU personal brand:

```
Home
 ├─ Hero (1 flagship product, real photo)
 ├─ Trust strip (real, specific numbers)
 ├─ Meet the 4 Flavours (bento grid — all 4, no filters needed)
 ├─ Why Swadyum (process — 4 cards, keep as is, fix icons/photos)
 ├─ Combo spotlight (Heritage Box + Spicy Duo — keep, this is good)
 ├─ Real reviews (fewer, real, with photos if possible)
 ├─ Story snippet + CTA → About
 └─ Footer (fixed logo, WhatsApp link, real social links)

Shop  → Becomes a single page: "All 4 Flavours" + "Combos" toggle (2 tabs, not 6 filter pills + search + slider)
Product detail (4 of these) → Hero image, weight selector (250g/500g/1kg), real reviews for THAT product, "pairs well with" cross-sell to the other 3
About → Keep narrative, fix founder name + remove duplicate/overlapping scroll sections, add real Madhubani-art photography if available
Contact → WhatsApp-first CTA at top, form below as fallback
```

---

## 7. MOBILE-FIRST IMPLEMENTATION NOTES (for Antigravity)

- **Nav:** On mobile, collapse to logo (center) + hamburger (left) + cart icon (right). The current 5-link inline nav (Home/Shop/About/Blog/Contact) will not fit cleanly under 400px — confirm this is already handled; if not, this is a build requirement, not optional.
- **Sticky add-to-cart bar:** on product detail pages, once user scrolls past the main image, show a slim sticky bottom bar with product name, price, and Add to Cart button — keeps the primary action in the thumb zone at all times.
- **Product showcase:** replace the 4-across desktop grid with a horizontally swipeable card carousel on mobile (one full-width card visible, swipe for next) rather than shrinking 4 columns into a cramped mobile grid.
- **Process / "Why Swadyum" cards:** use a 2×2 bento grid on mobile instead of a horizontal scroll of 4 cards — easier to scan without sideways gestures.
- **Images:** compress and lazy-load all jar photography; this directly affects mobile load speed, which directly affects conversion (per 2026 trend research, speed is treated as a core ranking + conversion factor, not just nice-to-have).
- **Forms/checkout:** single-page, minimal-field checkout; auto-detect pincode where possible; large tap targets (min 44px) throughout.

---

## 8. CONTENT FIXES NEEDED FROM SHASHWAT (please confirm before build)

1. **Final locked product list** — confirm exact 4 products, final names, final weights/prices (250g/500g/1kg if all 3 sizes are real), so there's one single source of truth instead of the 3 different price sets currently scattered across Home/Shop/Combo sections.
2. **Real product photography** — do you have actual photos of your own jars, or do we need to plan an AI-generated / styled photography brief (consistent backdrop: terracotta plate, mustard seeds, dried chilies, like the one good hero shot) to replace the stock images?
3. **Real founder identity** — your name/story (or whoever the public face of Swadyum is) to replace "Nora Bell" — even 2–3 lines in your own words is enough for me to write the final About copy.
4. **Honest current stats** — actual customer count / orders so far (even if small, e.g. "200+ orders," "50+ families") instead of the inflated 10,000+/50,000+ placeholders. Small, specific, real numbers will build more trust than big fake ones for a brand at this stage.

---

## 9. PRIORITY ROADMAP (hand this sequence to Antigravity)

**Phase 0 — Fix what's broken (do this first, before any redesign):**
- Replace all stock product images with real/approved photography
- Fix founder name + photo on About page
- Fix sticky-header overlap bug (z-index/scroll-margin)
- Fix broken footer logo
- Reconcile product names/prices/weights into one data source used everywhere

**Phase 1 — Design system foundation:**
- Implement color tokens (chili/mustard/mango-led palette)
- Implement typography (drop script font, add confident serif + sans pairing)
- Build the 3-tier button system, replace all CTA variants
- Add Madhubani-inspired SVG section dividers

**Phase 2 — Rebuild core pages:**
- Home: bento-style "4 flavours" section replacing the oversized grid
- Shop: collapse to "Flavours / Combos" 2-tab view, remove search/slider/6-filter UI
- Product detail pages (×4): hero image, size selector, reviews, cross-sell
- About: fix narrative flow, real founder content, real cultural photography
- Contact: WhatsApp-first

**Phase 3 — Mobile-first pass:**
- Sticky bottom add-to-cart bar
- Swipeable product carousel
- 2×2 bento for process cards
- Thumb-zone audit on every CTA

**Phase 4 — Trust & polish:**
- Replace stat numbers with honest, specific data
- Add real review photos if available
- Scroll-reveal micro-animations (restrained)
- Image compression / lazy load / speed pass

---

## 10. ONE-LINE BRIEF FOR ANTIGRAVITY

> Rebuild Swadyum.store as a **small, confident, single-origin pickle brand** site — not a catalog store. Visual language: warm chili-mustard-mango palette over cream, bold serif headlines, Madhubani-inspired line motifs, real jar photography styled consistently. Mobile-first throughout (thumb-zone CTAs, swipeable product cards, sticky add-to-cart). Information architecture sized for exactly 4 products + 2 combos — no big-catalog UI patterns (search/filter/sort) that imply a bigger store than it is. Every number on the site must be real and specific, not round/inflated.

---

*End of document.*
