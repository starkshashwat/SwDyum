// ============================================================================
// scripts/data-migration/extract.js
// ----------------------------------------------------------------------------
// Phase 4 — Data Migration / Seed Extraction Layer
//
// This module is the SINGLE SOURCE OF TRUTH for what catalog content gets
// seeded into the normalized Supabase schema. It reads the real, hardcoded
// data that currently lives inside the root `src/` frontend (JS data modules
// + JSX component constants) and normalizes it into plain objects whose keys
// match the Phase 1 SQL schema column names EXACTLY (see
// migrations/v2_normalized_schema/001..003). Nothing here is fabricated —
// every value is copied verbatim from a real source file, and each extractor
// documents the file + line range it was transcribed from.
//
// IMPORTANT — what this file deliberately does NOT do:
//   * It does NOT import the frontend modules at runtime. The frontend
//     modules import `../supabaseClient` and React deps that don't resolve
//     in a plain Node context, so we inline the data as constants instead.
//     This keeps the script dependency-free and deterministic.
//   * It does NOT call Supabase directly. All persistence goes through the
//     Phase 2 backend admin API (see apiClient.js + seed.js).
//   * It does NOT invent placeholder rows. Where a source has no real data
//     (e.g. deals), the extractor returns [] and the seeder logs that fact.
//
// Exported functions (consumed by seed.js):
//   extractCategories()
//   extractProducts()
//   extractTrustBadges(productSlug)
//   extractIngredients(productSlug)
//   extractFaqs(productSlug)
//   extractProcessSteps(productSlug)
//   extractCombos()
//   extractDeals()
//   extractReviews()
//   extractCoupons()
//
// All run synchronously and return arrays (or objects) of seed payloads.
// ============================================================================

// ---------------------------------------------------------------------------
// Source: src/data/products.js (lines 3-7) — standardPrices map
// ---------------------------------------------------------------------------
const STANDARD_PRICES = {
    '250g': 299,
    '500g': 599,
    '1kg': 899,
};

// Canonical short description reused across products.js (line 56) and
// pdpContentMap.js (line 3).
const MANGO_SHORT_DESCRIPTION =
    'Sharp, tangy raw Langda mango pickle, sun-cured in cold-pressed mustard oil, made in small batches in Ara, Bihar.';

// ---------------------------------------------------------------------------
// Source: src/data/pdpContentMap.js (lines 1-59) — full PDP config for the
// only real product, 'mango-pickle'. Transcribed verbatim.
// ---------------------------------------------------------------------------
const MANGO_PDP_CONFIG = {
    short_description: MANGO_SHORT_DESCRIPTION,
    tabs: {
        description:
            'Har Bihari ghar mein ek martaban hota hai jiski khushboo poore aangan mein bas jaati hai — that jar is what we bottled. Made the way our family has always made it in Ara, Bhojpur: raw Langda aam, ped se seedha plucked green, hand-cut and dhoop mein pakaya (sun-cured), then rested in cold-pressed Kachi Ghani mustard oil with a slow-ground masala of saunf, methi, mangraila aur hing. No artificial colours, no synthetic flavours — bas dhoop, tel aur purani reet. Tangy, bold, and just-oily-enough, it turns a plain dal-bhaat into a proper meal. Chhote batches mein banaya, taaki har jar mein wahi ghar wala swaad rahe.',
        ingredients_table: [
            { name: 'आम — Raw Langda Mango', reason: "Purvanchal's pride, plucked green off the tree — perfect khatta + Vitamin C" },
            { name: 'सरसों तेल — Mustard Oil', reason: 'Cold-pressed Kachi Ghani; bold pungency + natural preservation' },
            { name: 'सरसों पाउडर — Mustard powder', reason: 'The classic achaari sharpness' },
            { name: 'सौंफ — Fennel seeds', reason: 'Sweet, aromatic; aids digestion' },
            { name: 'मेथी पाउडर — Fenugreek powder', reason: 'Signature achaari depth that balances the tang' },
            { name: 'मंगरैला (कलौंजी) — Nigella seeds', reason: 'Earthy aroma — the soul of the achaar' },
            { name: 'अजवाइन — Carom seeds', reason: 'Warm & digestive; cuts through the oil' },
            { name: 'हींग — Asafoetida', reason: 'That unmistakable achaar khushboo + digestion' },
            { name: 'धनिया पाउडर — Coriander powder', reason: 'Mellow, earthy body' },
            { name: 'लाल मिर्ची पाउडर — Red chilli powder', reason: 'Deep colour + measured heat' },
            { name: 'हल्दी पाउडर — Turmeric', reason: 'Golden hue + everyday immunity' },
            { name: 'नमक — Salt', reason: 'Seasoning + natural preservation' },
            { name: 'सिरका — Vinegar', reason: 'A tangy zing that also keeps every jar fresh longer' },
        ],
        storage:
            'Thandi sookhi jagah, hamesha sookha chammach. Tel ki parat upar bani rehne dein. Room temp theek hai, fridge zaroori nahi.',
    },
    pure_ingredients: [
        { name: 'Langda Aam', img: '/cat_mango.webp' },
        { name: 'Kachi Ghani Sarson Tel', img: '/cat_garlic.webp' },
        { name: 'Saunf', img: '/cat_lemon.webp' },
        { name: 'Mangraila (Kalonji)', img: '/cat_chilli.webp' },
        { name: 'Methi', img: '/cat_mango.webp' },
    ],
    taste_profile: {
        metrics: [
            { label: 'Tangy', level: 95 },
            { label: 'Spicy', level: 70 },
            { label: 'Oil Level', level: 60 },
            { label: 'Crunch', level: 65 },
        ],
        pairings: [
            { name: 'Litti-Chokha' },
            { name: 'Sattu Paratha' },
            { name: 'Dal-Bhaat' },
            { name: 'Khichdi' },
            { name: 'Poori-Sabzi' },
        ],
    },
    faq: [
        { q: 'Isme kya-kya hai — preservative?', a: 'No artificial colours ya synthetic flavours. Namak, sarson tel, thoda sirka aur dhoop — yahi isse naturally fresh rakhte hain.' },
        { q: 'Kitna spicy hai?', a: 'Medium' },
        { q: 'Kaise store karein?', a: 'Thandi sookhi jagah, hamesha sookha chammach. Tel ki parat upar bani rehne dein.' },
        { q: 'Fridge zaroori?', a: 'Nahi, room temp theek hai.' },
        { q: 'Kaunsa aam?', a: 'Raw Langda aam, ped se seedha green plucked — for that perfect khatta.' },
        { q: 'Best kab lagta hai?', a: '3 din baad, jab masala poori tarah rach jaaye.' },
        { q: 'Kya isme fungus lag sakta hai?', a: 'Nahi, jab tak nami na jaaye. Jar humidity-controlled kitchen mein moisture-free seal hota hai — bas aap sookha chammach use karein aur tel ki parat upar rehne dein.' },
    ],
};

// ---------------------------------------------------------------------------
// Source: src/CategoryPage.jsx (lines 7-22) — categoriesData
// Maps to `categories` table: slug, name, description, banner_url.
// `tag` and `subtitle` have no column in the normalized schema and are
// dropped (documented here, not silently lost).
// ---------------------------------------------------------------------------
export function extractCategories() {
    return [
        {
            slug: 'pickles',
            name: 'Signature Bihari Pickles Collection',
            description:
                'Explore our collection of traditional, sun-matured pickles made with cold-pressed mustard oil, local organic spices, and generational culinary techniques. Every recipe is rooted in regional culinary traditions.',
            banner_url: '/banner.webp',
            is_active: true,
            sort_order: 0,
        },
        {
            slug: 'mango-pickle',
            name: 'Handcrafted Mango Pickles',
            description:
                "Made with firm, green raw mangoes hand-sliced and sun-cured over weeks. Infused with coarse mustard seeds, kalonji, fennel, and cold-pressed mustard oil, this tangy delicacy represents the heart of Bihar's summers.",
            banner_url: '/cat_mango.webp',
            is_active: true,
            sort_order: 1,
        },
    ];
}

// ---------------------------------------------------------------------------
// Source: src/CategoryPage.jsx (lines 25-34) — pairingsData
// Maps to `category_pairings` table: category_id, label, icon, sort_order.
// The schema has NO description column, so `desc` is dropped (documented).
// Both "Mango" and "default" keys carry identical content; we associate the
// pairings with the 'mango-pickle' category (the only category whose tag is
// "Mango"). Returned shape: [{ categorySlug, label, sort_order }, ...].
// ---------------------------------------------------------------------------
export function extractCategoryPairings() {
    const pairings = [
        { title: 'Sattu Paratha & Dahi', desc: 'The tangy raw mango slices break down the roasted gram flour warmth perfectly.' },
        { title: 'Arhar Dal & Steamed Rice', desc: 'A classic Bihari lunch complete with a dollop of pure ghee and mango achar.' },
    ];
    return pairings.map((p, i) => ({
        categorySlug: 'mango-pickle',
        label: p.title,
        sort_order: i,
    }));
}

// ---------------------------------------------------------------------------
// Source: src/data/products.js + src/data/pdpContentMap.js
// Only 'mango-pickle' is a real product. Variants come from standardPrices.
// `pdp_config` is stored as JSONB on the products row.
// ---------------------------------------------------------------------------
export function extractProducts() {
    return [
        {
            slug: 'mango-pickle',
            name: 'Handcrafted Mango Pickles',
            description: MANGO_PDP_CONFIG.tabs.description,
            category_slug: 'mango-pickle',
            pdp_config: MANGO_PDP_CONFIG,
            is_active: true,
            sort_order: 0,
            // Variants derived from standardPrices (products.js lines 3-7).
            variants: Object.entries(STANDARD_PRICES).map(([weightLabel, price], i) => ({
                weight_label: weightLabel,
                price,
                mrp: null, // no MRP data in source
                stock_quantity: 0, // no stock data in source; default per schema
                sku: null,
                is_active: true,
                sort_order: i,
            })),
        },
    ];
}

// ---------------------------------------------------------------------------
// Source: src/SocialProofSection.jsx (rendered badges, lines 28-48) +
// src/components/cart/CartDrawer.jsx (lines 642-643 trust strip).
// Deduped by label. The FSSAI badge is rendered with an <img> instead of an
// emoji, but `emoji` is a required (non-null) column, so we use a neutral
// placeholder emoji '✅' for that one row and document the substitution.
// ---------------------------------------------------------------------------
export function extractTrustBadges(productSlug = 'mango-pickle') {
    const badges = [
        { emoji: '✅', label: 'FSSAI Registered' }, // img='/fssai.png' in source; emoji placeholder
        { emoji: '🌿', label: 'No Artificial Preservatives' },
        { emoji: '🔒', label: 'Secure Payments' },
        { emoji: '📦', label: 'Freshly Packed' },
        { emoji: '🍃', label: '100% Natural' }, // from CartDrawer trust strip
    ];
    // Dedupe by label (Secure Payments appears in both sources).
    const seen = new Set();
    const unique = [];
    for (const b of badges) {
        if (seen.has(b.label)) continue;
        seen.add(b.label);
        unique.push(b);
    }
    return unique.map((b, i) => ({
        product_slug: productSlug,
        emoji: b.emoji,
        label: b.label,
        description: null,
        sort_order: i,
        is_active: true,
    }));
}

// ---------------------------------------------------------------------------
// Source: src/data/pdpContentMap.js (lines 7-21) — ingredients_table array.
// Maps to `product_ingredients`: ingredient (name), percentage (null, no
// percentage data in source), sort_order.
// ---------------------------------------------------------------------------
export function extractIngredients(productSlug = 'mango-pickle') {
    return MANGO_PDP_CONFIG.tabs.ingredients_table.map((row, i) => ({
        product_slug: productSlug,
        ingredient: row.name,
        percentage: null,
        sort_order: i,
    }));
}

// ---------------------------------------------------------------------------
// Source: src/data/pdpContentMap.js (lines 49-57) — faq array.
// Maps to `product_faqs`: question (q), answer (a), sort_order.
// ---------------------------------------------------------------------------
export function extractFaqs(productSlug = 'mango-pickle') {
    return MANGO_PDP_CONFIG.faq.map((row, i) => ({
        product_slug: productSlug,
        question: row.q,
        answer: row.a,
        sort_order: i,
        is_active: true,
    }));
}

// ---------------------------------------------------------------------------
// Source: src/components/pdp/PdpProcessTimeline.jsx (lines 4-35) — steps.
// Maps to `product_process_steps`: step_number (index+1), title, description
// (desc), icon (img path string, fits optionalShortText max 500).
// ---------------------------------------------------------------------------
export function extractProcessSteps(productSlug = 'mango-pickle') {
    const steps = [
        { img: '/process_sourcing_1783263006944.webp', title: 'Harvest', desc: 'Hand-picked raw Langda mangoes sourced direct from Purvanchal farms' },
        { img: '/making_mango.webp', title: 'Cut by Hand', desc: 'Washed, sliced, and prepped — no machines, just skilled hands' },
        { img: '/process_grinding_1783263018468.webp', title: 'Traditional Blend', desc: 'Aromatic spice masala ground and mixed in small batches' },
        { img: '/process_mixing_1783263028798.webp', title: 'Oil-Dressed', desc: 'Coated in cold-pressed Kachi Ghani mustard oil for bold flavour' },
        { img: '/process_suncured_1783263051169.webp', title: 'Sun Cured', desc: "Slow-matured under open sun — the way it's been done for generations" },
        { img: '/process_aging_1783263039730.webp', title: 'Sealed & Shipped', desc: 'Packed moisture-free in glass jars, delivered straight to your door' },
    ];
    return steps.map((s, i) => ({
        product_slug: productSlug,
        step_number: i + 1,
        title: s.title,
        description: s.desc,
        icon: s.img,
        is_active: true,
    }));
}

// ---------------------------------------------------------------------------
// Source: src/ComboOfferSection.jsx (lines 5-27) — combos array.
// Maps to `combos` table: slug (id), title, description, price, mrp
// (oldPrice), image_url (image), is_active, sort_order.
//
// combo_items: the `includes` array lists product display names, but only
// "Signature Mango" maps to a real product (mango-pickle). The other names
// (Authentic Garlic, Stuffed Green Chilli, Sweet & Sour Lemon) have NO
// matching real product in src/. We return a `combo_items` array per combo
// containing only the items we can resolve to a real product slug; the
// seeder will warn about unresolvable includes.
// ---------------------------------------------------------------------------
const COMBO_PRODUCT_NAME_MAP = {
    'Signature Mango': 'mango-pickle',
    // The following names appear in `includes` but have no real product:
    // 'Authentic Garlic', 'Stuffed Green Chilli', 'Sweet & Sour Lemon'
};

export function extractCombos() {
    const combos = [
        {
            id: 'combo-1',
            title: 'The Bihari Heritage Box',
            description:
                'Our four bestselling pickles in a premium rigid box. Perfect for gifting or stocking your pantry with authentic flavors.',
            includes: ['Signature Mango', 'Authentic Garlic', 'Stuffed Green Chilli', 'Sweet & Sour Lemon'],
            price: 999,
            oldPrice: 1187,
            save: 188,
            image: '/banner.webp',
            popular: true,
        },
        {
            id: 'combo-2',
            title: 'The Spicy Duo',
            description: 'A fiery combination for those who love a kick in every bite.',
            includes: ['Authentic Garlic', 'Stuffed Green Chilli'],
            price: 549,
            oldPrice: 598,
            save: 49,
            image: '/prod_chili.webp',
        },
    ];
    return combos.map((c, i) => {
        const resolvedItems = c.includes
            .map((name) => COMBO_PRODUCT_NAME_MAP[name])
            .filter((slug) => slug) // drop unresolvable names
            .map((slug) => ({ product_slug: slug, quantity: 1 }));
        return {
            slug: c.id,
            title: c.title,
            description: c.description,
            price: c.price,
            mrp: c.oldPrice,
            image_url: c.image,
            is_active: true,
            sort_order: i,
            // Attached for the seeder; not a column on the combos table.
            combo_items: resolvedItems,
            // Names that could not be resolved to a real product slug.
            unresolved_includes: c.includes.filter((name) => !COMBO_PRODUCT_NAME_MAP[name]),
        };
    });
}

// ---------------------------------------------------------------------------
// Source: src/DealSection.jsx (lines 4-98).
// The DealSection component contains ONLY a visual countdown timer
// (hardcoded hours/minutes/seconds) and static marketing copy — there is NO
// real deal entity data (no title, no product link, no price, no start/end
// time). Per the "never fabricate" rule, extractDeals() returns [].
// ---------------------------------------------------------------------------
export function extractDeals() {
    return [];
}

// ---------------------------------------------------------------------------
// Source: src/CategoryPage.jsx (lines 37-41) customerReviewsData +
// src/ReviewsPage.jsx (lines 4-9) initialReviews.
//
// IMPORTANT: These reviews CANNOT be seeded through the admin API. The
// backend reviews router (backend/src/routes/reviews.routes.js) exposes only
// GET (list/detail) and PUT/PATCH (moderation: is_approved/is_featured) and
// DELETE — there is NO POST route (see controller header comment). Reviews
// are created by customers via a separate public surface.
//
// We still return the combined candidate list for documentation/audit so the
// seeder can print exactly what would have been seeded if a route existed.
// ---------------------------------------------------------------------------
export function extractReviews() {
    const fromCategoryPage = [
        { name: 'Siddharth Raj', rating: 5, text: "The taste is completely home-style. I haven't had such good raw mango pickle since I left Patna." },
        { name: 'Ananya Mishra', rating: 5, text: "Oil-free lemon pickle is a masterpiece. It's digestively soothing and incredibly sweet and sour!" },
        { name: 'Rajesh Ranjan', rating: 5, text: 'Bold garlic pickle with pure mustard oil flavor. Highly recommended with warm parathas.' },
    ];
    const fromReviewsPage = [
        { name: 'Prerna Singh', rating: 5, text: 'Tastes exactly like the mango pickle my grandmother used to dry on the terrace. The mustard oil smell is so pure!' },
        { name: 'Mayank Sharma', rating: 5, text: 'The balance of spices is fantastic. It goes perfectly with warm parathas and ghee. Will buy again!' },
        { name: 'Aarav K.', rating: 4, text: 'Incredibly rich garlic pickle. High quality packaging, jars came safely.' },
        { name: 'Dr. Shalini Sinha', rating: 5, text: 'Oil-free lemon pickle is perfect for senior family members. Not too salty, just the right amount of sweet and sour maturity.' },
    ];
    return [...fromCategoryPage, ...fromReviewsPage];
}

// ---------------------------------------------------------------------------
// Source: src/components/cart/CartDrawer.jsx (lines 80, 149-153).
// WELCOME10 is a client-side-only coupon: applying code 'WELCOME10' sets a
// 10% discount (Math.round(subtotal * 0.1)). The '10' in the code name plus
// the 0.1 multiplier make the discount unambiguous. This is a borderline
// extraction (the coupon lives only in frontend code, not in any data
// module), but it is defensible because the code string + multiplier are real
// hardcoded values, not invented. Schema fields: code (uppercased),
// discount_type 'percentage', discount_value 10, min_order_value 0,
// max_uses null, expiry_date null, is_active true.
// ---------------------------------------------------------------------------
export function extractCoupons() {
    return [
        {
            code: 'WELCOME10',
            description: 'Welcome offer — 10% off your first order (client-side coupon migrated from CartDrawer.jsx).',
            discount_type: 'percentage',
            discount_value: 10,
            min_order_value: 0,
            max_uses: null,
            expiry_date: null,
            is_active: true,
        },
    ];
}

// ---------------------------------------------------------------------------
// Convenience: a single manifest object describing every extractor and the
// counts it yields, used by seed.js for the opening summary log.
// ---------------------------------------------------------------------------
export function extractionManifest() {
    return {
        categories: extractCategories().length,
        category_pairings: extractCategoryPairings().length,
        products: extractProducts().length,
        trust_badges: extractTrustBadges().length,
        ingredients: extractIngredients().length,
        faqs: extractFaqs().length,
        process_steps: extractProcessSteps().length,
        combos: extractCombos().length,
        deals: extractDeals().length,
        reviews: extractReviews().length, // not seedable — see note above
        coupons: extractCoupons().length,
    };
}
