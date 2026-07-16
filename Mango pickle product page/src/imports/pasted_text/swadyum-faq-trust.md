# Swadyum — FAQ + Trust Badges
## Figma Design Prompt · Product Page Ender

---

## 🎯 One-Line Brief
Design the **closing section of Swadyum's Aam Ka Achaar product page** — a 7-question FAQ accordion + 4-badge trust strip + a WhatsApp CTA. This section's job: resolve the last doubt before purchase. Tone: honest, conversational, Hinglish. Not a legal page. Not a chatbot. A friend answering at the kitchen table.

---

## 📐 SECTION STRUCTURE (top to bottom)

```
┌─────────────────────────────────────────────────────────┐
│  SECTION A — FAQ Accordion                              │
│  Background: #F7F1E6 (warm cream)                       │
│  Max-width: 680px, centred, padding: 64px 24px 0        │
├─────────────────────────────────────────────────────────┤
│  SECTION B — Trust Strip                                │
│  Full-bleed background: #1C1208 (deep ink)              │
│  4 badges in a horizontal row, no max-width constraint  │
├─────────────────────────────────────────────────────────┤
│  SECTION C — WhatsApp CTA Band                          │
│  Background: #F7F1E6 (cream, same as A)                 │
│  Max-width: 680px, centred, padding: 40px 24px 64px     │
└─────────────────────────────────────────────────────────┘
```

---

## 🅰 SECTION A — FAQ Accordion

### Header
```
── ──  SEEDHA SAWAAL, SEEDHA JAWAAB          ← eyebrow (amber, 11px, tracked)
आपके मन की बात                              ← Noto Serif Devanagari, 26px Bold, #1C1208
Jo puchna tha, woh yahan hai.               ← DM Sans, 13px, #8B7355
```

**Eyebrow anatomy:** 28px amber rule (`#C4862B`) → 10px gap → uppercase label (11px, +0.14em tracking). Same system as Ingredients and Taste Profile sections.

---

### Accordion Item Anatomy

Each FAQ row consists of:

```
┌──────────────────────────────────────────────────────┐
│  01   Isme kya-kya hai — preservative?          [+]  │
├──────────────────────────────────────────────────────┤ ← 1px #E8DFD0 divider
│       ↳ [answer, 14px, #4A3820, hidden by default]  │
└──────────────────────────────────────────────────────┘
```

**Question row (closed state):**
- Left: question number `01` — 11px, `#C4862B`, Bold, fixed 22px wide
- Middle: question text — 15px, DM Sans 500, `#1C1208`
- Right: `+` icon — 20×20px, thin strokes, `#8B7355`
- Padding: 18px top/bottom, 0 left/right
- Border-bottom: 1px solid `#E8DFD0`
- First item also has border-top: 1px solid `#E8DFD0`

**Question row (open/expanded state):**
- Question text colour changes to `#C4862B` (amber)
- `+` icon collapses to `–` (vertical bar disappears)
- No background fill change — keeps cream

**Answer (revealed state):**
- Padding: 0 0 20px 30px
- Left border: 2px solid `#E8DFD0`, with 22px left margin (aligns under number)
- Font: 14px, DM Sans 400, `#4A3820` (warm dark brown)
- Line-height: 1.7
- Key terms bolded in `#1C1208` DM Sans 500
- Max-height animation: 0 → auto, 350ms ease

**Interaction rule:** Single-open accordion. Opening one closes any previously open item. No simultaneous expansion.

---

### All 7 FAQ Items (exact copy, ordered)

| # | Question | Answer |
|---|---|---|
| 01 | Isme kya-kya hai — preservative? | No artificial colours ya synthetic flavours. **Namak, sarson tel, thoda sirka aur dhoop** — yahi isse naturally fresh rakhte hain. Wahi jo daadi ke haath ka achaar karta tha. |
| 02 | Kitna spicy hai? | **Medium heat** — tez nahi, phika bhi nahi. Lal mirch hai, lekin tang aur masala usse balance karta hai. Ghar ke sab log kha sakte hain. |
| 03 | Kaise store karein? | Thandi, sookhi jagah rakhein. **Hamesha sookha chammach** use karein — paani andar gaya toh kharaab ho sakta hai. Tel ki parat upar bani rehne dein, woh natural seal hai. |
| 04 | Fridge zaroori hai? | **Nahi** — room temperature bilkul theek hai. Fridge mein rakhne ki zaroorat nahi, actually isse oil thak jaata hai. Bas pantry ya kitchen shelf kaafi hai. |
| 05 | Kaunsa aam use kiya hai? | **Raw Langda aam** — ped se seedha green plucked, Purvanchal ka pride. Isi se woh perfect khatta aata hai jo factory-made achaar mein nahi milta. |
| 06 | Best kab lagta hai yeh achaar? | **3 din baad** — jab masala poori tarah rach jaaye aur aam thoda aur naram ho jaaye. Pehle din bhi acha hai, teesre din magical hai. |
| 07 | Kya isme fungus lag sakta hai? | **Nahi** — jab tak nami na jaaye. Jar humidity-controlled kitchen mein moisture-free seal hota hai. Bas ek kaam aap karein: **sookha chammach** use karein aur tel ki parat upar rehne dein. |

---

## 🅱 SECTION B — Trust Strip

**Background:** `#1C1208` (same deep ink as Taste Profile section — creates consistent dark band)
**Layout:** 4 equal-width columns, full viewport width, no gap between columns
**Height:** 80px (desktop) / auto (mobile, 2×2 grid)

### Each Badge Cell
```
┌─────────────────────────────────┐
│  [●]  FSSAI Licensed            │ ← #F7F1E6, 11px, Bold
│       Lic. No. 21XXX000000XXX   │ ← #5C4A30, 10px
└─────────────────────────────────┘
```

**Icon circle:** 32×32px, `border-radius: 50%`, background `#2D2010`, icon colour `#C4862B`
**Label:** 11px, DM Sans 600, `#F7F1E6`, letter-spacing +0.01em
**Sublabel:** 10px, DM Sans 400, `#5C4A30`
**Cell padding:** 24px 20px
**Separator:** 1px solid `#2D2010` between cells (right border on each except last)

### 4 Badge Cells (exact copy)

| Icon (Tabler) | Label | Sublabel |
|---|---|---|
| `ti-certificate` | FSSAI Licensed | Lic. No. 21XXX000000XXX |
| `ti-flask` | Lab-Tested | Small-batch kitchen |
| `ti-droplet-off` | Moisture-Free Packed | Sealed at source |
| `ti-users` | 100+ Families | Bihar · Delhi · aur aage |

**Mobile (< 600px):** Wrap into 2×2 grid. Odd-column cells keep right border. Bottom row has no bottom border. Last cell loses border-right.

---

## 🅲 SECTION C — WhatsApp CTA Band

**Background:** `#F7F1E6` (cream — seamless continuation from FAQ)
**Layout:** Flex row, space-between, max-width 680px, centred

**Left copy block:**
```
Aur kuch jaanna hai?          ← Noto Serif Devanagari, 18px Bold, #1C1208
Hum WhatsApp par hain         ← DM Sans, 12px, #8B7355, margin-top 3px
— seedha poochho.
```

**Right — WhatsApp Button:**
- Background: `#1A5C2A` (WhatsApp forest green — earned color, not arbitrary)
- Text: `#FFFFFF`, 13px, DM Sans 600, letter-spacing +0.01em
- Label: `💬  WhatsApp par poochho`
- Padding: 12px 22px, border-radius: 8px
- Hover: darken to `#134821`
- No border, no shadow — clean solid

**Mobile:** Stack vertically — copy above, button full-width below (border-radius 8px).

---

## 🎨 Palette (consistent with full page system)

| Token | Hex | Used in |
|---|---|---|
| `--ink` | `#1C1208` | Headings, Trust Strip bg |
| `--cream` | `#F7F1E6` | FAQ + CTA section bg |
| `--warm-brown` | `#4A3820` | Answer body text |
| `--muted` | `#8B7355` | Subheadings, closed question |
| `--divider` | `#E8DFD0` | FAQ row borders, answer left-border |
| `--amber` | `#C4862B` | Eyebrow, numbers, open question, badge icons |
| `--stone` | `#2D2010` | Trust strip cell bg, badge separators |
| `--deep-muted` | `#5C4A30` | Badge sublabels |
| `--wa-green` | `#1A5C2A` | WhatsApp CTA button |

---

## ✍️ Typography

| Role | Face | Weight | Size |
|---|---|---|---|
| Section heading (Hindi) | Noto Serif Devanagari | 700 | 26px |
| CTA heading (Hindi) | Noto Serif Devanagari | 700 | 18px |
| Question text | DM Sans | 500 | 15px |
| Answer text | DM Sans | 400 | 14px |
| Answer key terms | DM Sans | 500 | 14px |
| Eyebrow label | DM Sans | 500 | 11px, +0.14em |
| FAQ number | DM Sans | 600 | 11px, +0.06em |
| Badge label | DM Sans | 600 | 11px |
| Badge sublabel | DM Sans | 400 | 10px |
| Subheading copy | DM Sans | 400 | 12–13px |

---

## 📱 Responsive Behaviour

**Desktop (> 768px):**
- FAQ max-width 680px, centred
- Trust strip: 4-column full-width
- CTA: inline flex row

**Mobile (< 600px):**
- FAQ: full-width, same cream bg, all padding maintained
- Trust strip: 2×2 grid (50% per cell)
- CTA: stack vertically, button full-width

**Accordion on all breakpoints:** Same behaviour, only height changes.

---

## ✨ Interaction & Micromotion

| Moment | Behaviour | Duration |
|---|---|---|
| Accordion open | max-height 0 → ~160px, opacity 0→1 | 350ms ease-out |
| Accordion close | reverse | 250ms ease-in |
| `+` → `–` | Vertical bar scaleY(0) + opacity 0 | 200ms |
| Question text | colour shift to `#C4862B` on open | 150ms |
| Trust badge hover | subtle background brighten `#2D2010`→`#3A2A10` | 150ms |
| WhatsApp btn hover | bg `#1A5C2A`→`#134821` | 150ms |
| All motion | `@media (prefers-reduced-motion)`: opacity fades only | — |

---

## 🏗 Figma Component Hierarchy

```
[Frame] FAQ + Trust Section
│
├── [Frame] FAQ Block (Auto Layout, Vertical, gap 0)
│   ├── [Group] Section Header
│   │   ├── [Frame] Eyebrow (Horizontal)
│   │   │   ├── [Rectangle] Amber rule — 28×1px
│   │   │   └── [Text] SEEDHA SAWAAL...
│   │   ├── [Text] आपके मन की बात
│   │   └── [Text] Jo puchna tha...
│   │
│   └── [Frame] Accordion List (Auto Layout, Vertical, gap 0)
│       ├── [Component] FAQ Row ×7
│       │   ├── [Frame] Question Row (Horizontal, space-between)
│       │   │   ├── [Text] 01
│       │   │   ├── [Text] Question text
│       │   │   └── [Frame] Icon (Plus/Minus)
│       │   ├── [Rectangle] Divider — full-width, 1px
│       │   └── [Frame] Answer (hidden in closed variant)
│       └── [Property: State = Closed / Open]
│
├── [Frame] Trust Strip (Horizontal, fill container)
│   └── [Component] Badge Cell ×4
│       ├── [Frame] Icon Circle
│       │   └── [Icon] Tabler SVG
│       └── [Frame] Text Stack
│           ├── [Text] Label
│           └── [Text] Sublabel
│
└── [Frame] CTA Band (Horizontal, space-between)
    ├── [Frame] Text Stack
    │   ├── [Text] Aur kuch jaanna hai?
    │   └── [Text] Hum WhatsApp par hain...
    └── [Component] WhatsApp Button
        ├── [Frame] Icon (💬 or custom SVG)
        └── [Text] WhatsApp par poochho
```

---

## 🚫 What NOT to do

- **Don't use a chat bubble layout for the FAQ** — the conversational tone lives in the copy, not the shape. Clean accordion is more scannable on mobile and loads faster.
- **Don't add a search bar** — 7 questions is a browsable set, not a knowledge base.
- **Don't stack all 4 trust badges vertically** — the horizontal strip uses the dark ink background as a visual "seal" that stamps the product credibility. Vertical stacking loses that authority.
- **Don't use green for anything except the WhatsApp button** — green = WhatsApp in Indian consumer context. Diluting it removes the meaning.
- **Don't use emojis as primary icons in the trust strip** — use clean Tabler outline icons so it reads as credential, not informal decoration.
- **Don't open multiple FAQ rows simultaneously** — single-open accordion only. Dual-open creates visual noise and doubles scroll depth.
- **Don't add a footer here** — this is a *section* within a product page, not a standalone page. No nav links, no social icons.
- **Don't override amber with orange** — `#C4862B` is kachi ghani sarson tel colour, not a generic accent. It has earned semantic meaning across the full page by this point.

---

*Prompt version: July 2026 | Consistent with: Ingredients section palette + Taste Profile dark strip system*