# Swadyum — Mango Pickle Ingredients Section
## Complete Design Prompt for Stitch / Google

---

## 🎯 Brief in One Line
Design a **two-part ingredients section** for Swadyum's Aam Ka Achaar product page:
1. **"Pure Ingredients" Hero Showcase** — 6 image-backed hero cards
2. **Full Ingredient List Tab** — all 13 ingredients with Hindi names + benefit copy

**Audience:** Urban Indian buyers (25–45), D2C e-commerce, mobile-first, trust-driven.
**Brand soul:** Purvanchal artisan, grandma's recipe, zero shortcuts, kachi ghani purity.

---

## 🖼️ SECTION 1 — "Pure Ingredients" Hero Showcase (6 Cards)

### Layout Direction: Asymmetric Bento Grid
Use a **6-cell bento grid** with intentionally unequal card sizes — this is the dominant UI pattern of 2025–26 (Apple, Linear, Samsung all standardize on it). Cards hold one ingredient each. Larger cells = more narrative weight.

**Bento cell size map (12-col grid, desktop):**
```
[ Langda Aam — HERO 6col × 2row ] [ Kachi Ghani Sarson Tel — 6col × 1row ]
[                                ] [ Saunf — 3col × 1row ][ Mangraila — 3col × 1row ]
[ Methi — 4col × 1row ] [ Ajwain — 4col × 1row ] [ Haldi — 4col × 1row ]
```

**Mobile (single column):** Langda Aam card appears full-width first, the rest stack at 50% width in pairs, final card goes full-width.

### Card Anatomy (each card)
- **Full-bleed food photography background** — raw, unprocessed ingredient (not styled flatlay; close-up macro: the fennel seeds, the kalonji scattered on stone, the raw mango dripping)
- **Dark-to-transparent gradient overlay** from bottom 60% (so text is readable but image bleeds through)
- **Hindi name** — top-left, small, in Devanagari script, 11px, letter-spaced, white/60% opacity
- **English name** — bottom-left, display size (clamp 20px–28px), bold weight, white
- **Benefit pill** — bottom-right: a small frosted-glass chip (glassmorphism 2.0: `backdrop-filter: blur(8px)`, white/20% bg, white border/20%) containing 2–3 word benefit e.g. *"digestion ✓"*, *"cold-pressed purity"*
- **On hover/tap:** card lifts 6px with `box-shadow` deepening + benefit chip expands to show the one-line Hindi copy from the ingredient table

### Signature Visual Element
The **Langda Aam hero card** (6col wide) should have a subtle **parallax scroll offset** so the raw mango image scrolls slightly slower than the card border — creating depth without animation noise. This is the one memorable moment of the section.

---

## 📋 SECTION 2 — Full Ingredient List (Tab: "Saare Masaalay")

### Layout: Alternating Split-Row with Icon Column

Not a plain table. Each ingredient row is a **three-zone strip**:
```
[ ICON · Hindi Name ]  |  [ English Name ]  |  [ "Why it matters" copy ]
```

**Row structure details:**
- Left zone: **circular icon** (16px × 16px spice illustration — use emoji or SVG icon as placeholder) + Hindi name in Devanagari, 13px, muted warm color
- Mid zone: English name, 15px, semi-bold, dark ink
- Right zone: benefit copy, 14px, regular weight, slightly muted — the full "Why it matters" text from the data
- **Alternating row background:** rows alternate between `#FAFAF7` (near-white) and `#F5F0E8` (warm cream)
- **Accent left border:** each row has a 3px left border whose color corresponds to the ingredient's flavor family:

| Flavor Family | Border Color | Ingredients |
|---|---|---|
| Tang / Sour | `#C4862B` (amber) | Aam, Sirka |
| Pungent / Bold | `#8B3A1A` (deep rust) | Sarson Tel, Sarson Powder |
| Aromatic / Floral | `#5C7A3E` (forest green) | Saunf, Dhania |
| Earthy / Depth | `#6B4F2A` (dark wood) | Methi, Mangraila, Hing |
| Warm / Digestive | `#A0522D` (sienna) | Ajwain, Methi |
| Bright / Vibrant | `#C8860A` (turmeric gold) | Haldi, Lal Mirch |
| Neutral / Preserve | `#7A7A6E` (stone) | Namak |

**Row hover state:** the full row gets a warm cream wash (`#EDE4D4`) + the left border brightens + the benefit text slides 4px right (micro-interaction)

### Section Header
```
सामग्री              Ingredients
─────────────────────────────────
13 Pure Ingredients. Zero shortcuts.
```
Header: dual-language treatment — Hindi (Devanagari, display weight, large) on one line; English subtitle below in a lighter, smaller tracking-widened sans-serif.

---

## 🎨 Palette

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#1C1208` | Primary text, headings |
| `--cream` | `#F7F1E6` | Section background |
| `--warm-stripe` | `#EDE4D4` | Alternate table rows |
| `--amber` | `#C4862B` | Primary accent, CTA borders |
| `--rust` | `#8B3A1A` | Bold accent, hover states |
| `--turmeric` | `#D4A017` | Gold highlights, pill borders |
| `--glass-white` | `rgba(255,255,255,0.18)` | Frosted-glass chips |

**What to avoid:** No terracotta `#D97757` (it reads as Claude AI default). No flat white backgrounds. No generic "food website" dark-green + beige. This palette is rooted in the actual color of kachi ghani sarson tel meeting raw aam.

---

## ✍️ Typography

| Role | Face | Weight | Size |
|---|---|---|---|
| Display / Hindi | Noto Serif Devanagari | 700 | 32–48px |
| Display / English | Playfair Display | 700 | 28–40px |
| Body | DM Sans | 400 | 14–16px |
| Label / Caps | DM Mono | 500 | 11–12px, +0.08em tracking |
| Hindi UI labels | Noto Sans Devanagari | 400 | 11–13px |

**Type signature:** Hindi name in Devanagari Playfair-weight above the English — this is the one typographic risk that makes it memorable and authentic. It treats Devanagari as display type, not an afterthought.

---

## 📱 Responsiveness Rules

**Breakpoints:**
- `> 1024px` (desktop): Full bento grid + side-by-side table rows
- `768–1024px` (tablet): 2-column bento, table rows collapse mid/right zones to 2 lines each
- `< 768px` (mobile): Single-column bento, full-width table rows, icon + names stack above benefit copy

**Critical mobile detail:** The ingredient table becomes an **accordion on mobile** — each row taps to expand the "Why it matters" copy. Default state shows only Hindi + English name to avoid wall-of-text.

---

## ✨ Microinteractions (5 key moments)

1. **Card parallax** — Langda Aam hero card: image scrolls at 0.85× speed on scroll
2. **Card hover lift** — 6px translateY + shadow deepening, 200ms ease-out
3. **Benefit chip expand** — frosted chip slides open on hover to reveal full copy, 250ms
4. **Table row slide** — on hover, benefit text nudges 4px right, left border brightens
5. **Tab switch** — switching between hero cards / full list: crossfade + content shifts up by 8px (no jarring jump)

**Reduce-motion:** All transforms collapse to opacity-only fades when `prefers-reduced-motion: reduce` is set.

---

## 🚫 What NOT to do (for Stitch)

- **Don't use a standard HTML table** for the ingredient list — it reads clinical, not artisan
- **Don't make all bento cards equal size** — hierarchy through card size is the whole point
- **Don't put English above Hindi** — Hindi name is the cultural anchor; it leads
- **Don't use white as card background** — the cream and warm tones are doing the premium work
- **Don't animate everything** — parallax on Langda Aam card only; the rest is hover micro-interaction
- **Don't use flat pill badges** — the frosted glass chip is a key sophistication marker
- **Don't lose the color-coded border system** — it's the hidden visual logic that makes the list feel designed

---

## 📝 Full Content to Embed

### Section 2 — Ingredient Table (exact copy, ready to paste)

| # | Hindi Name | English Name | Why it matters |
|---|---|---|---|
| 1 | आम | Raw Langda Mango | Purvanchal's pride, plucked green off the tree — perfect khatta + Vitamin C |
| 2 | सरसों तेल | Mustard Oil | Cold-pressed Kachi Ghani; bold pungency + natural preservation |
| 3 | सरसों पाउडर | Mustard Powder | The classic achaari sharpness |
| 4 | सौंफ | Fennel Seeds | Sweet, aromatic; aids digestion |
| 5 | मेथी पाउडर | Fenugreek Powder | Signature achaari depth that balances the tang |
| 6 | मंगरैला (कलौंजी) | Nigella Seeds | Earthy aroma — the soul of the achaar |
| 7 | अजवाइन | Carom Seeds | Warm & digestive; cuts through the oil |
| 8 | हींग | Asafoetida | That unmistakable achaar khushboo + digestion |
| 9 | धनिया पाउडर | Coriander Powder | Mellow, earthy body |
| 10 | लाल मिर्ची पाउडर | Red Chilli Powder | Deep colour + measured heat |
| 11 | हल्दी पाउडर | Turmeric | Golden hue + everyday immunity |
| 12 | नमक | Salt | Seasoning + natural preservation |
| 13 | सिरका | Vinegar | A tangy zing that also keeps every jar fresh longer |

### Section 1 — Hero Card Labels (6 cards)

| Card | Hindi | English | Benefit Chip |
|---|---|---|---|
| 1 (HERO) | आम | Langda Aam | khatta + Vitamin C |
| 2 | सरसों तेल | Kachi Ghani Sarson Tel | cold-pressed purity |
| 3 | सौंफ | Saunf | digestion ✓ |
| 4 | मंगरैला | Mangraila (Kalonji) | soul of the achaar |
| 5 | मेथी | Methi | achaari depth |
| 6 | हींग | Hing | the achaar khushboo |

---

## 🏗️ Component Structure Hint (for Stitch)

```
<section class="ingredients-section">

  <!-- Part 1: Hero Bento -->
  <div class="ingredients-hero-label">Pure Ingredients</div>
  <div class="ingredients-bento-grid">
    <div class="bento-card bento-hero" data-ingredient="aam">...</div>
    <div class="bento-card" data-ingredient="sarson-tel">...</div>
    <!-- ...4 more -->
  </div>

  <!-- Part 2: Full List Tab -->
  <div class="ingredients-tab-header">
    <span class="hindi-display">सामग्री</span>
    <span class="sub-label">13 Pure Ingredients. Zero shortcuts.</span>
  </div>
  <div class="ingredients-list" role="list">
    <!-- Each row: icon | hindi + english | benefit -->
    <div class="ingredient-row" data-family="tang">
      <div class="ingredient-icon-name">
        <span class="hindi-name">आम</span>
        <span class="english-name">Raw Langda Mango</span>
      </div>
      <p class="ingredient-benefit">Purvanchal's pride...</p>
    </div>
    <!-- repeat ×13 -->
  </div>

</section>
```

---

*Prompt version: July 2026 | Trend basis: Bento Grid 2.0, Glassmorphism 2.0 (Apple Liquid Glass-inspired), Indian artisan food visual language, Devanagari-as-display-type, color-coded semantic UI*