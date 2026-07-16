# Mango Pickle Product Page — Background Color Consistency Audit & Plan

> **Status:** Planning document only. No code/CSS/JSX changes have been made.
> **Scope:** Audit of background-color usage across (a) the main Swadyum website (`src/`) and (b) the standalone `Mango pickle product page/` sub-project, with a unified remediation plan.
> **Date:** 2026-07-16

---

## 1. Executive Summary

This audit compares background-color usage between the main Swadyum website and the standalone "Mango pickle product page" prototype app. The findings reveal **three layers of inconsistency**:

1. **Token-level drift inside the main site** — `src/index.css` defines `--color-bg` and `--color-bg-warm` as *identical* values (`var(--brand-tertiary)` = `#FFFFFF`), eliminating the intended warm/cool background differentiation. This contradicts both the canonical Design System (`Swadyum Design System/tokens/colors.css`, where `--color-bg: #f4f8f5`) and the brand recommendation in `DESIGN.md` (`--color-bg: #FBF5EA` warm cream).
2. **Raw hex leakage** — multiple main-site CSS files hardcode hex values that bypass the token system entirely (e.g., `#f0f7ee`, `#1A4E28`, `#fdf6e3`, `#f5ead0`, `#ede0be`, `#1f3f1b`, `#ffffff`).
3. **Total token absence in the Mango Pickle page** — the sub-project uses zero CSS custom properties; every background is an inline Tailwind arbitrary value (`bg-[#...]`) with at least **6 distinct near-white/cream tones** and **4 distinct green values**, none of which match the main site's tokens.

The Mango Pickle page is a **separate standalone Figma-Make Vite app** (per `plans/pdp-alignment-diagnosis.md`) used only as a design source — it is NOT imported into the live site. The production PDP lives in `src/components/pdp/*.jsx` via `src/ProductDetailsPage.jsx`. Therefore this plan addresses (a) aligning the Mango Pickle prototype to the main site's token system if/when its patterns are ported, and (b) fixing the main site's own internal background inconsistencies so the "source of truth" is clean before any porting occurs.

---

## 2. Prior Context & Documented Discrepancies

Before defining new recommendations, the following prior decisions and tensions must be acknowledged:

### 2.1 `plans/design-system-migration.md` (legacy → token mapping)
This document established a mapping from legacy CSS variables to design-system tokens. Key documented values:
- `--color-primary` = `#0a5a32` (green-800)
- `--color-bg` = `#f4f8f5`
- `--color-surface` = `#ffffff`
- `--color-bg-warm` = `#faf7f2`

**DISCREPANCY:** The actual current `src/index.css` has since diverged from this plan:
- `--brand-primary` is now `#1A4E28` (not `#0a5a32`)
- `--color-bg` is now `var(--brand-tertiary)` = `#FFFFFF` (not `#f4f8f5`)
- `--color-bg-warm` is now `var(--brand-tertiary)` = `#FFFFFF` (not `#faf7f2`)

The migration plan appears **partially stale/superseded** by later changes to `src/index.css`. This plan does NOT contradict the migration plan; it flags that the live code has drifted from it and recommends reconciling.

### 2.2 `DESIGN.md` (root brand audit, §5.1)
Recommends a spice-toned warm palette:
| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FBF5EA` | Page background (warm cream) |
| `--color-ink` | `#241A14` | Primary text |
| `--color-chili` | `#C1402B` | Primary brand / CTAs |
| `--color-mustard` | `#D99A1B` | Secondary accent |
| `--color-mango` | `#E8762C` | Tertiary accent |
| `--color-clay` | `#7C4A30` | Footer bg |
| `--color-card` | `#FFFFFF` | Card surfaces |

**DISCREPANCY:** `DESIGN.md` argues the site's dominant sage/forest green contradicts the brand brief (mustard/chili/mango spice palette) and recommends shifting away from green. However, both `plans/design-system-migration.md` and the actual current code (`src/index.css`) went with **green as primary** (`#1A4E28`). This is a documented, pre-existing brand-direction tension. This plan does NOT resolve the green-vs-spice brand question — it treats green-primary as the current de-facto decision and focuses only on background-color consistency.

### 2.3 `Swadyum Design System/tokens/colors.css` (canonical DS tokens)
The authoritative Design System token file defines:
```
--bg-tint: #f4f8f5;      /* pale green-tinted neutral */
--cream: #ebf2ed;
--warm-bg: #e6efe9;
--color-bg: var(--bg-tint);      /* = #f4f8f5 */
--color-surface: var(--white);   /* = #ffffff */
--color-cream: var(--cream);     /* = #ebf2ed */
--color-warm-bg: var(--warm-bg);/* = #e6efe9 */
--color-primary: var(--green-800); /* = #0a5a32 */
```

**DISCREPANCY:** The canonical DS uses pale green-tinted neutrals for backgrounds (`#f4f8f5`, `#ebf2ed`, `#e6efe9`). The live `src/index.css` has collapsed `--color-bg` and `--color-bg-warm` both to pure white `#FFFFFF`, losing this tinted-neutral differentiation entirely.

### 2.4 `plans/pdp-alignment-diagnosis.md`
Establishes that the "Mango pickle product page" folder is a **separate standalone Vite app** used only as a design source, NOT a live route. Production PDP components live in `src/components/pdp/*.jsx`. This architectural fact governs the risk/dependency section below.

---

## 3. Main Site Background-Color Inventory (Actual Current Code)

### 3.1 Token definitions — `src/index.css` (lines 1-200)

Critical token resolutions in the live `:root`:
| Token | Resolves to | Hex | Notes |
|---|---|---|---|
| `--brand-primary` | `#1A4E28` | `#1A4E28` | Primary green |
| `--brand-secondary` | `#E8F3EC` | `#E8F3EC` | Pale green tint |
| `--brand-tertiary` | `#FFFFFF` | `#FFFFFF` | **Pure white** |
| `--color-bg` | `var(--brand-tertiary)` | `#FFFFFF` | **Page bg = pure white** |
| `--color-bg-warm` | `var(--brand-tertiary)` | `#FFFFFF` | **Same as --color-bg — NO differentiation** |
| `--color-surface` | `var(--white)` | `#FFFFFF` | Card surfaces |
| `--color-cream` | `var(--cream-300)` → `var(--brand-secondary)` | `#E8F3EC` | Cream = pale green, not warm cream |
| `--warm-bg` | `var(--brand-tertiary)` | `#FFFFFF` | **"warm-bg" is literally pure white** |
| `--color-primary` | `var(--green-800)` → `var(--brand-primary)` | `#1A4E28` | |
| `--color-primary-dark` | `var(--green-900)` | `#12391d` | |
| `--color-border` | `var(--brand-secondary)` | `#E8F3EC` | |

**FINDING:** `body` (`src/index.css` base layer) sets `background-color: var(--color-bg)` = `#FFFFFF`. The entire main site's page background is **stark pure white**, despite the token names (`--color-bg-warm`, `--warm-bg`, `--color-cream`) implying warm/cream tones.

### 3.2 Section-level background usage (token-consistent)

The following files correctly use tokens for section backgrounds (even though the tokens resolve to white):
| File | Line | Class | Token used |
|---|---|---|---|
| `src/FeaturedProducts.css` | 4 | `.fp-section` | `var(--color-bg)` |
| `src/FeaturedProducts.css` | 140 | `.fp-card-img-wrap` | `var(--color-bg-warm)` |
| `src/ShopPage.css` | 6 | `.sp-wrapper` | `var(--color-bg)` |
| `src/ShopPage.css` | 287 | `.sp-card-img-wrap` | `var(--color-bg-warm)` |
| `src/DealSection.css` | 3 | `.deal-section` | `var(--color-bg)` |
| `src/ComboOfferSection.css` | 3 | `.combo-section` | `var(--color-bg)` |
| `src/ComboOfferSection.css` | 62 | `.combo-image-wrapper` | `var(--color-bg-warm)` |
| `src/SocialProofSection.css` | 3 | `.social-proof-section` | `var(--color-bg-warm)` |
| `src/ProcessSection.css` | 4 | `.process-v2` | `var(--color-bg-warm)` |
| `src/ProductDetailsPage.css` | 6 | `.pdp-wrapper` | `var(--color-bg)` |
| `src/ProductDetailsPage.css` | 45 | `.pdp-section--tint` | `var(--color-bg-warm)` |
| `src/ProductDetailsPage.css` | 49 | `.pdp-section--surface` | `var(--color-surface)` |
| `src/ReviewSection.css` | 3 | `.pdp-reviews-section` | `var(--color-surface)` |
| `src/ReviewSection.css` | 16 | `.reviews-summary-flex` | `var(--color-bg-warm)` |
| `src/ReviewsPage.css` | 5 | `.reviews-page-wrapper` | `var(--color-bg)` |
| `src/ReviewsPage.css` | 77 | `.reviews-trust-metrics-section` | `var(--color-bg-warm)` |
| `src/ReviewsPage.css` | 410 | `.reviews-feed-form-section` | `var(--color-bg-warm)` |
| `src/Footer.css` | 3 | `.site-footer` | `var(--brand-primary)` |
| `src/Header.css` | 3 | `.top-bar` | `var(--color-ink)` |
| `src/Header.css` | 95 | `.site-header.scrolled` | `#ffffff` (raw) |
| `src/Header.css` | 290 | `.mobile-menu` | `var(--color-bg)` |

### 3.3 Raw hex deviations (token-bypassing) — MAIN SITE

These are the inconsistencies within the main site itself:

| File | Line | Selector | Raw value | Should be |
|---|---|---|---|---|
| `src/Header.css` | 95 | `.site-header.scrolled` | `#ffffff` | `var(--white)` or `var(--color-surface)` |
| `src/ProcessSection.css` | 73 | `.process-proof-card` | `#ffffff` | `var(--white)` or `var(--color-surface)` |
| `src/ProcessSection.css` | 74 | `.process-proof-card` border | `#e2e8e0` | `var(--color-border)` |
| `src/ProcessSection.css` | 97 | `.proof-pulse` | `#10b981` | `var(--color-success)` (if defined) |
| `src/ProcessSection.css` | 104 | `.proof-card-title` color | `#1a1a1a` | `var(--color-ink)` |
| `src/ProcessSection.css` | 124 | `.proof-card-list li` color | `#444444` | `var(--color-muted)` |
| `src/ProductDetailsPage.css` | 197 | `.pdp-midpage-cta-inner` border | `#e1efe0` | `var(--color-border)` |
| `src/ProductDetailsPage.css` | 213 | `.pdp-midpage-cta-badge` color | `#1A4E28` | `var(--color-primary)` |
| `src/ProductDetailsPage.css` | 214 | `.pdp-midpage-cta-badge` bg | `#f0f7ee` | `var(--color-secondary)` or `var(--brand-secondary)` |
| `src/ProductDetailsPage.css` | 237 | `.pdp-midpage-cta-btn` bg | `#1A4E28` | `var(--color-primary)` |
| `src/ProductDetailsPage.css` | 251 | `.pdp-midpage-cta-btn:hover` bg | `#1f3f1b` | `var(--color-primary-dark)` (`#12391d`) — **hover color mismatch** |
| `src/FinalCTASection.css` | 5 | `.final-cta-section` bg | `linear-gradient(135deg, #fdf6e3 0%, #f5ead0 50%, #ede0be 100%)` | Warm cream/gold gradient — **completely different tonal family** from rest of site; needs a tokenized gradient or deliberate-exception flag |
| `src/components/ChoosePickleSection.css` | 4 | `.cps-section` bg | `var(--brand-tertiary, #FDFAF5)` | **Fallback `#FDFAF5` is warm cream** but actual `--brand-tertiary` = `#FFFFFF` — config drift bug; fallback assumes a value that no longer matches root |
| `src/components/ChoosePickleSection.css` | 60 | `.cps-card` bg | `#ffffff` | `var(--white)` or `var(--color-surface)` |
| `src/components/ChoosePickleSection.css` | 80 | `.cps-card-highlight` bg | `linear-gradient(180deg, #ffffff 0%, var(--brand-secondary, #E8F3EC) 100%)` | `#ffffff` → `var(--white)` |
| `src/components/ChoosePickleSection.css` | 128 | `.cps-need-label` color | `#d97706` | `var(--color-accent-dark)` or a dedicated amber token |
| `src/components/ChoosePickleSection.css` | 180 | `.btn-outline-green` bg | `#ffffff` | `var(--white)` |

**Key main-site anomalies:**
- **`FinalCTASection.css:5`** — A warm cream/gold gradient (`#fdf6e3 → #f5ead0 → #ede0be`) that is tonally alien to the rest of the site's white/pale-green palette. This is the single most visually jarring background inconsistency within the main site.
- **`ChoosePickleSection.css:4`** — Fallback `#FDFAF5` (warm cream) reveals the component was authored assuming `--brand-tertiary` was a warm cream, but the root now defines it as pure white. This is a latent config-drift bug.
- **`ProductDetailsPage.css:251`** — Hover state `#1f3f1b` does not match `--color-primary-dark` (`#12391d`); two different "dark green hover" values coexist.

---

## 4. Mango Pickle Product Page Background-Color Inventory

**Source:** `Mango pickle product page/src/App.tsx` (single 497-line component, all styling via inline Tailwind utility classes).
**CSS:** `Mango pickle product page/src/index.css` contains only `@import 'tailwindcss';` — **zero custom properties / design tokens defined.**

Every background is a raw arbitrary Tailwind value. Full inventory:

### 4.1 Pure white backgrounds
| Line | Context | Value |
|---|---|---|
| 69 | Root `<div>` | `bg-white` |
| 76 | Header | `bg-white` |
| 379 | Taste/pairings section | `bg-white` |

### 4.2 Off-white / cream / beige family (6 distinct values, no shared token)
| Line | Context | Value | Closest main-site token |
|---|---|---|---|
| 441 | FAQ section bg | `#fbfaf6` | none (near-white warm) |
| 367 | Ingredient list row alt | `#fafaf7` | none (near-white) |
| 340, 360 | Ingredients section bg | `#f7f1e6` | none (warm cream/beige) |
| 132 | Product image well bg | `#f5f0e8` | none (warm beige) — **main site uses `var(--color-bg-warm)` = `#FFFFFF` for equivalent** |
| 146, 224, 243 | Badge / subscribe card bg | `#f0f7ee` | coincidentally matches `ProductDetailsPage.css:214` raw hex, but neither is tokenized |
| 368 | Ingredient icon circle bg | `#e8dbc5` | none (tan/beige) |

### 4.3 Green family (4 distinct values, none match main site `--brand-primary: #1A4E28`)
| Line | Context | Value | Main-site equivalent |
|---|---|---|---|
| 71 | Announcement bar bg | `#2d5a27` | `--brand-primary` is `#1A4E28` — **mismatch** |
| 380 | Taste section dark card bg | `#234622` | none — distinct dark green |
| 429 | Recipe pairing card bg | `#1c371b` | none — yet another distinct dark green |
| 77 | Logo text color | `#1a3a1a` | none — distinct (text, not bg, but tonally relevant) |
| 492 | WhatsApp CTA button bg | `#2d5a27` | reuses announcement-bar green |
| 471 | Trust strip bg | `#234622` | reuses taste-section green |

### 4.4 Dark brown / black
| Line | Context | Value |
|---|---|---|
| 345 | Ingredient hero cards bg | `#1c1208` | Very dark brown/black — high-contrast dark card on cream section |

### 4.5 Hover states
| Line | Context | Value |
|---|---|---|
| 492 | WhatsApp CTA hover | `#1f3f1b` | Coincidentally matches `ProductDetailsPage.css:251` raw hover hex — but neither is tokenized |

**Summary:** The Mango Pickle page uses **at least 11 distinct background hex values** with zero tokenization, zero CSS variables, and no alignment to the main site's token system. The green values are particularly problematic — 4 different greens, none matching `--brand-primary: #1A4E28`.

---

## 5. Cross-Project Inconsistency Matrix

| Surface / Element | Main Site (token → resolved) | Mango Pickle Page (raw) | Verdict |
|---|---|---|---|
| Page background | `var(--color-bg)` → `#FFFFFF` | `bg-white` → `#FFFFFF` | ✅ Match (both white) |
| Header background | `bg-white` / `var(--color-bg)` → `#FFFFFF` | `bg-white` → `#FFFFFF` | ✅ Match |
| Announcement bar | `var(--color-ink)` → `#112018` (dark) | `#2d5a27` (green) | ❌ Mismatch — main site uses dark ink, Mango uses green |
| Product image well | `var(--color-bg-warm)` → `#FFFFFF` | `#f5f0e8` (warm beige) | ❌ Mismatch — main site white, Mango warm beige |
| Best-seller badge bg | `var(--brand-secondary)` → `#E8F3EC` | `#f0f7ee` (raw) | ❌ Close but not equal; neither tokenized on Mango side |
| Primary green | `--brand-primary` → `#1A4E28` | `#2d5a27` / `#234622` / `#1c371b` / `#1a3a1a` | ❌ 4 distinct greens, none match |
| Primary green hover | `--color-primary-dark` → `#12391d` (but `ProductDetailsPage.css:251` uses `#1f3f1b`) | `#1f3f1b` | ⚠️ Coincidental match on stray hex, but both bypass tokens |
| Footer bg | `var(--brand-primary)` → `#1A4E28` | (no footer in Mango page) | N/A |
| Card surfaces | `var(--color-surface)` → `#FFFFFF` | `bg-white` / `#1c1208` (dark cards) | ❌ Dark cards have no main-site equivalent |
| Section "warm" bg | `var(--color-bg-warm)` → `#FFFFFF` (broken token) | `#f7f1e6`, `#fbfaf6`, `#f5f0e8` | ❌ Mango has actual warm tones; main site token is broken (white) |
| Final CTA gradient | `#fdf6e3 → #f5ead0 → #ede0be` (raw, main site only) | (no equivalent) | ⚠️ Main-site-only anomaly |

---

## 6. Recommended Unified Background Color Palette

The recommendation respects the **current de-facto decision** (green-primary, per live code) while restoring the warm/cool background differentiation that the token names imply and the canonical Design System defines.

### 6.1 Recommended token values (to restore in `src/index.css`)

| Token | Recommended value | Hex | Rationale |
|---|---|---|---|
| `--brand-primary` | keep current | `#1A4E28` | De-facto primary green; do not change without brand decision |
| `--brand-secondary` | keep current | `#E8F3EC` | Pale green tint for badges/secondary surfaces |
| `--brand-tertiary` | **`#FBF5EA`** | `#FBF5EA` | **Restore warm cream** — aligns with `DESIGN.md` §5.1 recommendation; gives `--color-bg-warm` an actual warm tone instead of white |
| `--color-bg` | `var(--white)` | `#FFFFFF` | Keep page bg pure white (current behavior) |
| `--color-bg-warm` | **`var(--brand-tertiary)` → `#FBF5EA`** | `#FBF5EA` | **Fix:** once `--brand-tertiary` is warm cream, this token differentiates from `--color-bg` |
| `--color-surface` | `var(--white)` | `#FFFFFF` | Cards stay white |
| `--color-cream` | **`#EBF2ED`** or `#FBF5EA` | — | Decide: keep pale-green cream (DS canonical) OR align with warm cream. Recommend `#FBF5EA` for brand warmth consistency with `--color-bg-warm` |
| `--warm-bg` | `var(--brand-tertiary)` | `#FBF5EA` | Same as `--color-bg-warm` |

**Alternative (conservative):** If the team does NOT want warm cream backgrounds, then **rename the misleading tokens** — `--color-bg-warm` and `--warm-bg` should not imply "warm" if they resolve to white. Either give them warm values or rename to `--color-bg-tint` / `--color-bg-alt`.

### 6.2 Recommended Mango Pickle page alignment

When porting Mango Pickle page patterns to the production PDP (`src/components/pdp/`), map its raw hex values to main-site tokens:

| Mango raw hex | Map to token | Resolved |
|---|---|---|
| `bg-white` | `var(--color-bg)` / `var(--color-surface)` | `#FFFFFF` |
| `#fbfaf6`, `#fafaf7` | `var(--color-bg-warm)` (after fix) | `#FBF5EA` |
| `#f7f1e6`, `#f5f0e8` | `var(--color-bg-warm)` (after fix) | `#FBF5EA` |
| `#f0f7ee` | `var(--brand-secondary)` | `#E8F3EC` |
| `#e8dbc5` | New token `--color-tan` or keep as deliberate accent | TBD |
| `#2d5a27` | `var(--color-primary)` | `#1A4E28` |
| `#234622`, `#1c371b` | `var(--color-primary-dark)` or new `--color-primary-deep` | `#12391d` or new |
| `#1a3a1a` | `var(--color-primary-dark)` | `#12391d` |
| `#1c1208` | New token `--color-ink-deep` or `var(--color-ink)` | `#112018` |
| `#1f3f1b` (hover) | `var(--color-primary-dark)` | `#12391d` |

---

## 7. Prioritized Action Items

### P0 — Critical (token system integrity)

1. **`src/index.css` — Fix `--brand-tertiary` / `--color-bg-warm` collapse.**
   - Currently `--brand-tertiary: #FFFFFF` makes `--color-bg-warm`, `--warm-bg`, `--cream-100/200/300` all resolve to white.
   - **Action:** Set `--brand-tertiary: #FBF5EA` (warm cream, per `DESIGN.md` §5.1) OR rename the misleading "warm" tokens if white is intentional.
   - **Impact:** Restores warm/cool background differentiation across ProcessSection, SocialProofSection, ComboOfferSection, FeaturedProducts image wells, ShopPage image wells, PDP tint sections, ReviewsPage sections.

2. **`src/components/ChoosePickleSection.css:4` — Fix fallback drift bug.**
   - Fallback `#FDFAF5` assumes warm cream; root defines `#FFFFFF`.
   - **Action:** After fixing `--brand-tertiary` in P0-1, the fallback becomes consistent. Remove the fallback or align it to the new root value.

### P1 — High (raw hex → token migration, main site)

3. **`src/ProductDetailsPage.css:213-251` — Tokenize midpage CTA.**
   - `#1A4E28` → `var(--color-primary)`
   - `#f0f7ee` → `var(--brand-secondary)` or `var(--color-secondary)`
   - `#1f3f1b` (hover) → `var(--color-primary-dark)` (`#12391d`) — **fixes hover mismatch**
   - `#e1efe0` (border) → `var(--color-border)`

4. **`src/FinalCTASection.css:5` — Decide on warm cream gradient.**
   - The `#fdf6e3 → #f5ead0 → #ede0be` gradient is tonally alien to the rest of the site.
   - **Option A:** Tokenize as `--gradient-cta-warm` and keep as a deliberate exception.
   - **Option B:** Replace with a token-based gradient using `--color-bg-warm` / `--brand-secondary`.
   - **Recommendation:** Option A with a documented design rationale, since this section may intentionally evoke warm spice tones per `DESIGN.md`.

5. **`src/ProcessSection.css` — Tokenize raw hex.**
   - Line 73: `#ffffff` → `var(--white)`
   - Line 74: `#e2e8e0` → `var(--color-border)`
   - Line 97: `#10b981` → `var(--color-success)` (define if missing)
   - Line 104: `#1a1a1a` → `var(--color-ink)`
   - Line 124: `#444444` → `var(--color-muted)`

6. **`src/components/ChoosePickleSection.css` — Tokenize raw hex.**
   - Line 60: `#ffffff` → `var(--white)`
   - Line 80: `#ffffff` → `var(--white)`
   - Line 128: `#d97706` → `var(--color-accent-dark)` or new amber token
   - Line 180: `#ffffff` → `var(--white)`

7. **`src/Header.css:95` — Tokenize.**
   - `#ffffff` → `var(--white)` or `var(--color-surface)`

### P2 — Medium (Mango Pickle page tokenization, for porting)

8. **`Mango pickle product page/src/index.css` — Add design tokens.**
   - Define `:root` with the same token names/values as `src/index.css` so the prototype can reference tokens instead of raw hex.
   - This is a prerequisite for any pattern porting to `src/components/pdp/`.

9. **`Mango pickle product page/src/App.tsx` — Map raw hex to tokens.**
   - Replace all `bg-[#...]` with token-referencing classes or CSS-variable-based utilities.
   - Consolidate the 4 green values → `--color-primary` / `--color-primary-dark`.
   - Consolidate the 6 cream/off-white values → `--color-bg-warm` / `--color-surface`.
   - Map `#1f3f1b` hover → `--color-primary-dark`.

### P3 — Low (documentation & governance)

10. **Reconcile `plans/design-system-migration.md` with live `src/index.css`.**
    - The migration plan documents `--color-bg: #f4f8f5` and `--color-primary: #0a5a32`, but live code has `#FFFFFF` and `#1A4E28`.
    - **Action:** Update the migration plan to reflect current reality, or note the supersession.

11. **Resolve `DESIGN.md` brand-direction tension.**
    - `DESIGN.md` recommends spice palette (chili/mustard/mango); live code uses green-primary.
    - **Action:** Product/brand decision needed. This plan assumes green stays; if spice palette is adopted, a separate full re-tokenization is required.

12. **Add a lint/grep guard for raw hex in CSS.**
    - Add a CI check that flags `#[0-9a-fA-F]{3,8}` in `src/*.css` (excluding `src/index.css` token definitions) to prevent future raw-hex leakage.

---

## 8. Risk & Dependency Analysis

### 8.1 Architectural context
Per `plans/pdp-alignment-diagnosis.md`, the "Mango pickle product page" is a **standalone Vite app**, not a live route. Changes to it do NOT affect the production site until patterns are explicitly ported to `src/components/pdp/*.jsx`. Therefore:
- P0 and P1 actions (main-site fixes) are **independent** and can proceed safely.
- P2 actions (Mango page tokenization) are **non-blocking** and only matter when porting.

### 8.2 Risk: `--brand-tertiary` change ripple effect
Changing `--brand-tertiary` from `#FFFFFF` to `#FBF5EA` (P0-1) affects every token that references it:
- `--color-bg-warm` → `#FBF5EA` (intended)
- `--warm-bg` → `#FBF5EA` (intended)
- `--cream-100`, `--cream-200`, `--cream-300` → `#FBF5EA` (may affect any component using `--cream-*` tokens)
- **Mitigation:** Grep for `--cream-100`, `--cream-200`, `--cream-300`, `--warm-bg` usage across `src/` before applying. Visually QA the ProcessSection, SocialProofSection, ComboOfferSection, FeaturedProducts, ShopPage, PDP tint sections, and ReviewsPage after the change.

### 8.3 Risk: `FinalCTASection` gradient removal
If P1-4 Option B is chosen (replacing the warm gradient), the Final CTA section will lose its distinctive warm tone. This may reduce visual emphasis on the final conversion section. **Recommendation:** Option A (tokenize + keep) unless brand team confirms otherwise.

### 8.4 Risk: Hover color mismatch fix
P1-3 changes `#1f3f1b` → `#12391d` (`--color-primary-dark`). This is a subtle visible change to the midpage CTA hover state. Low risk but should be visually confirmed.

### 8.5 Dependencies
- P0-1 (brand-tertiary fix) must complete before P0-2 (ChoosePickleSection fallback) and before P2-9 (Mango page token mapping).
- P2-8 (Mango index.css tokens) must complete before P2-9 (App.tsx tokenization).
- P3-10 (migration doc reconciliation) should follow P0-1.

---

## 9. Verification Checklist

After implementation (future, not part of this plan):
- [ ] `--color-bg` and `--color-bg-warm` resolve to different hex values
- [ ] No raw `#ffffff` in `src/*.css` outside `src/index.css` token definitions
- [ ] No raw `#1A4E28` in `src/*.css` outside `src/index.css`
- [ ] `ProductDetailsPage.css` midpage CTA hover uses `--color-primary-dark`
- [ ] `FinalCTASection.css` gradient is either tokenized or documented as exception
- [ ] `ChoosePickleSection.css` fallback matches root `--brand-tertiary`
- [ ] Mango Pickle page `index.css` defines `:root` tokens matching main site
- [ ] Mango Pickle page `App.tsx` has zero `bg-[#...]` arbitrary values
- [ ] `plans/design-system-migration.md` updated to match live `src/index.css`
- [ ] Visual QA: ProcessSection, SocialProofSection, ComboOfferSection, FeaturedProducts, ShopPage, PDP, ReviewsPage, FinalCTA, ChoosePickleSection

---

## 10. Files Touched (Future Implementation)

| File | Action | Priority |
|---|---|---|
| `src/index.css` | Fix `--brand-tertiary` / `--color-bg-warm` | P0 |
| `src/components/ChoosePickleSection.css` | Fix fallback + tokenize raw hex | P0/P1 |
| `src/ProductDetailsPage.css` | Tokenize midpage CTA raw hex | P1 |
| `src/FinalCTASection.css` | Tokenize or document gradient | P1 |
| `src/ProcessSection.css` | Tokenize raw hex | P1 |
| `src/Header.css` | Tokenize `#ffffff` | P1 |
| `Mango pickle product page/src/index.css` | Add `:root` design tokens | P2 |
| `Mango pickle product page/src/App.tsx` | Replace raw hex with tokens | P2 |
| `plans/design-system-migration.md` | Reconcile with live code | P3 |

---

*End of plan. This document is a planning artifact only — no source files were modified.*
