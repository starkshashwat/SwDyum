// ============================================================================
// scripts/data-migration/seed.js
// ----------------------------------------------------------------------------
// Phase 4 — Main orchestration script.
//
// Loads .env, logs into the Phase 2 backend admin API, then seeds every
// real catalog entity extracted from the root `src/` frontend by extract.js.
//
// Design goals:
//   * IDEMPOTENT — re-running must not duplicate rows. Before each POST we
//     GET the relevant list and match by a natural key (slug / code / label
//     + product_id). If a match exists we skip (or PATCH where useful).
//   * CONTINUE-ON-ERROR — every API call is wrapped in try/catch. Errors are
//     collected and printed in a final summary; one bad row never aborts the
//     whole run.
//   * ORDER-AWARE — categories before products (products reference
//     categories), products before their child entities (variants, trust
//     badges, ingredients, faqs, process steps), combos before combo_items.
//   * HONEST — entities with no real source data (deals) are explicitly
//     skipped with a log line; reviews are skipped because the admin API
//     exposes no POST route (documented below).
//
// Run:
//   node scripts/data-migration/seed.js
//
// Env (see .env.example):
//   BACKEND_BASE_URL     default http://localhost:4000/api
//   SEED_ADMIN_EMAIL     required
//   SEED_ADMIN_PASSWORD  required
// ============================================================================

import dotenv from 'dotenv';
import {
    extractCategories,
    extractCategoryPairings,
    extractProducts,
    extractTrustBadges,
    extractIngredients,
    extractFaqs,
    extractProcessSteps,
    extractCombos,
    extractDeals,
    extractReviews,
    extractCoupons,
    extractionManifest,
} from './extract.js';
import { login, get, post, patch, ApiError } from './apiClient.js';

dotenv.config();

// ── Tiny console helpers ────────────────────────────────────────────────────
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};
const log = (msg) => console.log(msg);
const info = (msg) => console.log(`${c.cyan}•${c.reset} ${msg}`);
const ok = (msg) => console.log(`${c.green}✓${c.reset} ${msg}`);
const warn = (msg) => console.log(`${c.yellow}!${c.reset} ${msg}`);
const err = (msg) => console.log(`${c.red}✗${c.reset} ${msg}`);
const header = (msg) => console.log(`\n${c.bold}${c.magenta}=== ${msg} ===${c.reset}`);

// ── Counters ────────────────────────────────────────────────────────────────
const stats = {
    created: 0,
    skipped: 0,
    patched: 0,
    errors: 0,
    warnings: 0,
};
const errorLog = [];

function recordError(entity, label, e) {
    stats.errors++;
    const msg = e instanceof ApiError ? e.message : e?.message || String(e);
    errorLog.push({ entity, label, msg });
    err(`[${entity}] ${label}: ${msg}`);
}

// ── Idempotency helpers ─────────────────────────────────────────────────────

/**
 * Fetch all pages of a list endpoint (the backend caps limit at 100) and
 * return the `data` array. Uses the standard `{ data, pagination }` envelope.
 */
async function listAll(path) {
    const out = [];
    let page = 1;
    const limit = 100;
    // Safety cap to avoid infinite loops on misbehaving pagination.
    for (let i = 0; i < 50; i++) {
        const res = await get(path, { query: { page, limit } });
        const rows = res?.data ?? [];
        out.push(...rows);
        const total = res?.pagination?.total ?? rows.length;
        if (out.length >= total || rows.length === 0) break;
        page++;
    }
    return out;
}

/** Find an existing row by a natural key (e.g. slug). */
function findBy(rows, key, value) {
    return rows.find((r) => r[key] === value) || null;
}

// ── Per-entity seeders ──────────────────────────────────────────────────────

async function seedCategories() {
    header('Categories');
    const rows = extractCategories();
    let existing = [];
    try {
        existing = await listAll('/categories');
    } catch (e) {
        recordError('categories', 'list', e);
        return new Map();
    }
    const slugToId = new Map();
    for (const row of existing) slugToId.set(row.slug, row.id);

    for (const cat of rows) {
        const existingRow = slugToId.get(cat.slug);
        if (existingRow) {
            ok(`skip category "${cat.slug}" (exists, id=${existingRow.id})`);
            stats.skipped++;
            continue;
        }
        try {
            const res = await post('/categories', {
                slug: cat.slug,
                name: cat.name,
                description: cat.description,
                banner_url: cat.banner_url,
                is_active: cat.is_active,
                sort_order: cat.sort_order,
            });
            const id = res?.data?.id;
            slugToId.set(cat.slug, id);
            ok(`created category "${cat.slug}" (id=${id})`);
            stats.created++;
        } catch (e) {
            recordError('categories', cat.slug, e);
        }
    }
    return slugToId;
}

async function seedCategoryPairings(slugToCategoryId) {
    header('Category Pairings');
    const rows = extractCategoryPairings();
    if (rows.length === 0) {
        info('no category pairings to seed');
        return;
    }
    // Pairings are nested under /categories/:categoryId/pairings. We check
    // existing by listing that nested route.
    for (const p of rows) {
        const categoryId = slugToCategoryId.get(p.categorySlug);
        if (!categoryId) {
            warn(`skip pairing "${p.label}" — category "${p.categorySlug}" not found`);
            stats.warnings++;
            continue;
        }
        let existing = [];
        try {
            existing = await listAll(`/categories/${categoryId}/pairings`);
        } catch (e) {
            // Some backends may not paginate nested routes; ignore list failure
            // and attempt the POST (idempotency will rely on unique constraints).
        }
        const dup = existing.find((r) => r.label === p.label);
        if (dup) {
            ok(`skip pairing "${p.label}" (exists)`);
            stats.skipped++;
            continue;
        }
        try {
            await post(`/categories/${categoryId}/pairings`, {
                category_id: categoryId,
                label: p.label,
                sort_order: p.sort_order,
            });
            ok(`created pairing "${p.label}"`);
            stats.created++;
        } catch (e) {
            recordError('category_pairings', p.label, e);
        }
    }
}

async function seedProducts(slugToCategoryId) {
    header('Products + Variants');
    const rows = extractProducts();
    let existing = [];
    try {
        existing = await listAll('/products');
    } catch (e) {
        recordError('products', 'list', e);
        return new Map();
    }
    const slugToId = new Map();
    for (const row of existing) slugToId.set(row.slug, row.id);

    for (const p of rows) {
        const categoryId = slugToCategoryId.get(p.category_slug);
        if (!categoryId) {
            warn(`product "${p.slug}" — category "${p.category_slug}" not found; creating without category link`);
            stats.warnings++;
        }
        let existingRow = slugToId.get(p.slug);
        if (existingRow) {
            ok(`skip product "${p.slug}" (exists, id=${existingRow.id})`);
            stats.skipped++;
        } else {
            try {
                const res = await post('/products', {
                    slug: p.slug,
                    name: p.name,
                    description: p.description,
                    category_id: categoryId ?? null,
                    pdp_config: p.pdp_config,
                    is_active: p.is_active,
                    sort_order: p.sort_order,
                });
                existingRow = res?.data;
                slugToId.set(p.slug, existingRow.id);
                ok(`created product "${p.slug}" (id=${existingRow.id})`);
                stats.created++;
            } catch (e) {
                recordError('products', p.slug, e);
                continue;
            }
        }

        // Variants (nested under /products/:productId/variants)
        const productId = existingRow.id;
        let existingVariants = [];
        try {
            existingVariants = await listAll(`/products/${productId}/variants`);
        } catch (e) {
            recordError('product_variants', `${p.slug} list`, e);
        }
        for (const v of p.variants) {
            const dup = existingVariants.find((r) => r.weight_label === v.weight_label);
            if (dup) {
                ok(`skip variant "${v.weight_label}" for "${p.slug}" (exists)`);
                stats.skipped++;
                continue;
            }
            try {
                await post(`/products/${productId}/variants`, {
                    weight_label: v.weight_label,
                    price: v.price,
                    mrp: v.mrp,
                    stock_quantity: v.stock_quantity,
                    sku: v.sku,
                    is_active: v.is_active,
                });
                ok(`created variant "${v.weight_label}" @ ${v.price} for "${p.slug}"`);
                stats.created++;
            } catch (e) {
                recordError('product_variants', `${p.slug}/${v.weight_label}`, e);
            }
        }
    }
    return slugToId;
}

/**
 * Generic per-product child seeder for top-level routes that accept
 * product_id in the body and support ?product_id= filtering on list.
 * Used for trust badges, ingredients, faqs, process steps.
 */
async function seedChildEntities({ entityName, path, rows, matchKey }) {
    header(entityName);
    if (rows.length === 0) {
        info(`no ${entityName} to seed`);
        return;
    }
    // Group rows by product_slug so we can resolve product_id and filter.
    const byProduct = new Map();
    for (const r of rows) {
        const slug = r.product_slug;
        if (!byProduct.has(slug)) byProduct.set(slug, []);
        byProduct.get(slug).push(r);
    }

    // We need product ids; fetch the products list once.
    let products = [];
    try {
        products = await listAll('/products');
    } catch (e) {
        recordError(entityName, 'products list', e);
        return;
    }
    const slugToId = new Map(products.map((p) => [p.slug, p.id]));

    for (const [slug, group] of byProduct) {
        const productId = slugToId.get(slug);
        if (!productId) {
            warn(`skip ${entityName} for "${slug}" — product not found`);
            stats.warnings++;
            continue;
        }
        let existing = [];
        try {
            existing = await listAll(`${path}?product_id=${productId}`);
        } catch (e) {
            recordError(entityName, `${slug} list`, e);
        }
        for (const row of group) {
            const dup = existing.find((r) => r[matchKey] === row[matchKey] && (matchKey !== 'step_number' || r.step_number === row.step_number));
            if (dup) {
                ok(`skip ${entityName} "${row[matchKey]}" for "${slug}" (exists)`);
                stats.skipped++;
                continue;
            }
            const payload = { ...row, product_id: productId };
            delete payload.product_slug;
            try {
                await post(path, payload);
                ok(`created ${entityName} "${row[matchKey]}" for "${slug}"`);
                stats.created++;
            } catch (e) {
                recordError(entityName, `${slug}/${row[matchKey]}`, e);
            }
        }
    }
}

async function seedCombos(slugToProductId) {
    header('Combos + Combo Items');
    const rows = extractCombos();
    let existing = [];
    try {
        existing = await listAll('/combos');
    } catch (e) {
        recordError('combos', 'list', e);
        return;
    }
    const slugToComboId = new Map(existing.map((c) => [c.slug, c.id]));

    for (const combo of rows) {
        let comboId = slugToComboId.get(combo.slug);
        if (comboId) {
            ok(`skip combo "${combo.slug}" (exists, id=${comboId})`);
            stats.skipped++;
        } else {
            try {
                const res = await post('/combos', {
                    slug: combo.slug,
                    title: combo.title,
                    description: combo.description,
                    price: combo.price,
                    mrp: combo.mrp,
                    image_url: combo.image_url,
                    is_active: combo.is_active,
                    sort_order: combo.sort_order,
                });
                comboId = res?.data?.id;
                slugToComboId.set(combo.slug, comboId);
                ok(`created combo "${combo.slug}" (id=${comboId})`);
                stats.created++;
            } catch (e) {
                recordError('combos', combo.slug, e);
                continue;
            }
        }

        // Combo items (nested under /combos/:comboId/items)
        if (combo.combo_items.length === 0) {
            warn(`combo "${combo.slug}" has 0 resolvable combo_items (unresolved: ${combo.unresolved_includes.join(', ') || 'none'})`);
            stats.warnings++;
            continue;
        }
        let existingItems = [];
        try {
            existingItems = await listAll(`/combos/${comboId}/items`);
        } catch (e) {
            recordError('combo_items', `${combo.slug} list`, e);
        }
        for (const item of combo.combo_items) {
            const productId = slugToProductId.get(item.product_slug);
            if (!productId) {
                warn(`skip combo_item for "${combo.slug}" — product "${item.product_slug}" not found`);
                stats.warnings++;
                continue;
            }
            const dup = existingItems.find((r) => r.product_id === productId);
            if (dup) {
                ok(`skip combo_item ${item.product_slug} in "${combo.slug}" (exists)`);
                stats.skipped++;
                continue;
            }
            try {
                await post(`/combos/${comboId}/items`, {
                    product_id: productId,
                    quantity: item.quantity,
                });
                ok(`created combo_item ${item.product_slug} (qty ${item.quantity}) in "${combo.slug}"`);
                stats.created++;
            } catch (e) {
                recordError('combo_items', `${combo.slug}/${item.product_slug}`, e);
            }
        }
        if (combo.unresolved_includes.length > 0) {
            warn(`combo "${combo.slug}" includes have no real product: ${combo.unresolved_includes.join(', ')}`);
            stats.warnings++;
        }
    }
}

async function seedDeals() {
    header('Deals');
    const rows = extractDeals();
    if (rows.length === 0) {
        info('no deals to seed — src/DealSection.jsx contains only a visual countdown, no real deal entity data. Skipping (per "never fabricate" rule).');
        return;
    }
    // If real deal data existed, we would POST to /deals here.
    for (const d of rows) {
        try {
            await post('/deals', d);
            ok(`created deal "${d.title || d.slug}"`);
            stats.created++;
        } catch (e) {
            recordError('deals', d.title || d.slug, e);
        }
    }
}

async function seedCoupons() {
    header('Coupons');
    const rows = extractCoupons();
    let existing = [];
    try {
        existing = await listAll('/coupons');
    } catch (e) {
        recordError('coupons', 'list', e);
        return;
    }
    for (const c of rows) {
        const dup = existing.find((r) => (r.code || '').toUpperCase() === c.code.toUpperCase());
        if (dup) {
            ok(`skip coupon "${c.code}" (exists)`);
            stats.skipped++;
            continue;
        }
        try {
            await post('/coupons', {
                code: c.code,
                description: c.description,
                discount_type: c.discount_type,
                discount_value: c.discount_value,
                min_order_value: c.min_order_value,
                max_uses: c.max_uses,
                expiry_date: c.expiry_date,
                is_active: c.is_active,
            });
            ok(`created coupon "${c.code}"`);
            stats.created++;
        } catch (e) {
            recordError('coupons', c.code, e);
        }
    }
}

function reportReviews() {
    header('Reviews (NOT seedable)');
    const rows = extractReviews();
    info(`Found ${rows.length} candidate reviews in src/ (CategoryPage.jsx + ReviewsPage.jsx).`);
    warn('These CANNOT be seeded: backend/src/routes/reviews.routes.js exposes no POST route (only GET + PUT/PATCH moderation + DELETE). Reviews are created by customers via a separate public surface.');
    warn('Skipping review creation. Candidate list is printed below for audit only:');
    for (const r of rows) {
        console.log(`    - ${r.name} (${r.rating}★): ${r.text.slice(0, 60)}...`);
    }
    stats.warnings++;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    console.log(`${c.bold}${c.cyan}Swadyum Phase 4 — Data Migration / Seed${c.reset}`);
    console.log(`${c.dim}Backend: ${process.env.BACKEND_BASE_URL || 'http://localhost:4000/api'}${c.reset}`);

    // Print extraction manifest up front so the operator sees what's coming.
    const manifest = extractionManifest();
    console.log(`${c.dim}Extraction manifest:${c.reset}`, manifest);

    if (!email || !password) {
        err('Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD. Aborting.');
        err('Copy scripts/data-migration/.env.example to .env and fill in admin credentials.');
        process.exit(1);
    }

    // 1. Login
    header('Login');
    try {
        const { user } = await login(email, password);
        ok(`Logged in as ${user?.email || email}`);
    } catch (e) {
        recordError('auth', 'login', e);
        printSummary();
        process.exit(1);
    }

    // 2. Seed in dependency order
    const slugToCategoryId = await seedCategories();
    await seedCategoryPairings(slugToCategoryId);
    const slugToProductId = await seedProducts(slugToCategoryId);

    await seedChildEntities({
        entityName: 'Trust Badges',
        path: '/trust-badges',
        rows: extractTrustBadges(),
        matchKey: 'label',
    });
    await seedChildEntities({
        entityName: 'Ingredients',
        path: '/product-ingredients',
        rows: extractIngredients(),
        matchKey: 'ingredient',
    });
    await seedChildEntities({
        entityName: 'FAQs',
        path: '/faqs',
        rows: extractFaqs(),
        matchKey: 'question',
    });
    await seedChildEntities({
        entityName: 'Process Steps',
        path: '/process-steps',
        rows: extractProcessSteps(),
        matchKey: 'step_number',
    });

    await seedCombos(slugToProductId);
    await seedDeals();
    await seedCoupons();
    reportReviews();

    printSummary();
}

function printSummary() {
    header('Summary');
    console.log(`${c.green}created :${c.reset}  ${stats.created}`);
    console.log(`${c.yellow}skipped :${c.reset}  ${stats.skipped}`);
    console.log(`${c.cyan}patched :${c.reset}  ${stats.patched}`);
    console.log(`${c.yellow}warnings:${c.reset}  ${stats.warnings}`);
    console.log(`${c.red}errors  :${c.reset}  ${stats.errors}`);
    if (errorLog.length > 0) {
        header('Error details');
        for (const e of errorLog) {
            err(`[${e.entity}] ${e.label}: ${e.msg}`);
        }
    }
    if (stats.errors > 0) process.exitCode = 1;
}

main().catch((e) => {
    err(`Unhandled error in main(): ${e?.stack || e}`);
    process.exit(1);
});
