---
name: swadyum-design
description: Use this skill to generate well-branded interfaces and assets for Swadyum (Taste of Bihar), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key facts to internalize before designing:
- Brand: Swadyum — heritage Bihari pickles (achaar), D2C, "luxury culinary heritage" positioning.
- Palette: forest green primary (`#0a5a32`), lime secondary (`#c8dca0`), amber accent (`#e8a83a`), on a pale green-tinted cream background (`#f4f8f5`). No blue, no purple, no gradients beyond soft cream image scrims.
- Type: Poppins (headings, 700/800) + Plus Jakarta Sans (body). Signature move: italicize one emotional word inside a headline, in primary green, lighter weight — e.g. "Meet the *4 Flavours*".
- Shapes: fully-rounded pill buttons, 24px-radius cards, 1px light-green borders at rest, soft green-tinted shadow + lift on hover.
- Icons: hand-drawn inline SVGs only, Feather-style (24px viewBox, stroke=currentColor, 2px round strokes) — never an icon font or filled icon set. Emoji only in small transactional UI copy (delivery/security microcopy), never in headlines.
- One illustrated flourish: thin-line "Madhubani" (Mithila folk-art) motifs as sparse section dividers — see `components/layout/Divider.jsx`.
- See `readme.md` for full Content Fundamentals and Visual Foundations sections before writing new copy or layouts.
