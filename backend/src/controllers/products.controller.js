// ============================================================================
// controllers/products.controller.js
// ----------------------------------------------------------------------------
// CRUD controller for `products` and nested `product_variants`.
//
// Nesting decision: product_variants are exposed as a NESTED resource under
// /products/:productId/variants (documented in the task as an acceptable
// choice). Rationale: a variant (e.g. "200g") has no meaning without its
// parent product, mirrors the UNIQUE(product_id, weight_label) constraint,
// and matches how the admin UI naturally edits variants inside a product
// editor screen.
//
// product_images and product_ingredients get their OWN top-level route
// files (productImages.routes.js / productIngredients.routes.js) per the
// required file structure, but their controllers still filter/scope by
// product_id via query param or body field — see productImages.controller.js
// and productIngredients.controller.js.
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';

/**
 * GET /products
 * Paginated, searchable, filterable list of products.
 * Query: page, limit, search (matches name/slug), category_id, is_active.
 * Includes nested variants and images for convenience (avoids N+1 fetches
 * from the admin UI product list view).
 */
export const listProducts = asyncHandler(async (req, res) => {
    const { page, limit, search, category_id, is_active } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await resilientQuery(supabaseAdmin, {
        table: 'products',
        select: '*, product_variants(*), product_images(*)',
        order: 'sort_order',
        range: [from, to],
        count: true,
        filters: (q) => {
            if (search) q = q.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
            if (category_id) q = q.eq('category_id', category_id);
            if (is_active !== undefined) q = q.eq('is_active', is_active);
            return q;
        },
    });
    if (error) throw error;

    res.json({ data, pagination: { page, limit, total: count } });
});

/** GET /products/:id — single product with all nested content entities. */
export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'products',
        select: '*, product_variants(*), product_images(*), product_ingredients(*), product_trust_badges(*), product_faqs(*), product_process_steps(*)',
        single: true,
        filters: (q) => isUuid ? q.eq('id', id) : q.eq('slug', id),
    });

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Product not found.' });
        throw error;
    }

    const cfg = data.pdp_config || {};

    if (!data.product_ingredients || data.product_ingredients.length === 0) {
        const tableIngs = cfg.tabs?.ingredients_table || [];
        if (tableIngs.length > 0) {
            data.product_ingredients = tableIngs.map((item, idx) => ({
                id: `ing-${idx}`,
                ingredient: item.name || item.ingredient,
                reason: item.reason || '',
                percentage: item.percentage || null,
                sort_order: idx
            }));
        } else if (Array.isArray(data.pure_ingredients)) {
            data.product_ingredients = data.pure_ingredients.map((item, idx) => ({
                id: `ing-${idx}`,
                ingredient: item.name,
                reason: item.benefit || '',
                percentage: null,
                sort_order: idx
            }));
        } else {
            data.product_ingredients = [];
        }
    }

    if (!data.product_trust_badges || data.product_trust_badges.length === 0) {
        const badges = cfg.trust_badges || [
            { badge_key: 'natural', icon: '🌿', label: '100% Natural' },
            { badge_key: 'suncured', icon: '☀️', label: 'Sun Cured' },
            { badge_key: 'labtested', icon: '🧪', label: 'Lab Tested' },
            { badge_key: 'microbatch', icon: '🏺', label: 'Micro-Batch Crafted' }
        ];
        data.product_trust_badges = badges.map((b, idx) => ({
            id: `tb-${idx}`,
            badge_key: b.badge_key || b.label,
            icon: b.icon || '🌿',
            label: b.label || b.badge_key,
            sort_order: idx
        }));
    }

    if (!data.product_faqs || data.product_faqs.length === 0) {
        const faqs = cfg.faq || [];
        data.product_faqs = faqs.map((f, idx) => ({
            id: `faq-${idx}`,
            question: f.q || f.question,
            answer: f.a || f.answer,
            sort_order: idx
        }));
    }

    if (!data.product_process_steps || data.product_process_steps.length === 0) {
        const steps = cfg.process_steps || [];
        data.product_process_steps = steps.map((s, idx) => ({
            id: `step-${idx}`,
            step_number: s.step_number || idx + 1,
            title: s.title,
            description: s.desc || s.description,
            image_url: s.img || s.image_url,
            is_active: true
        }));
    }

    res.json({ data });
});

/** POST /products — create a new product. Admin only. */
export const createProduct = asyncHandler(async (req, res) => {
    let payload = { ...req.body };
    let { data, error } = await supabaseAdmin
        .from('products')
        .insert(payload)
        .select()
        .single();

    if (error && error.message?.includes('sort_order')) {
        delete payload.sort_order;
        const retry = await supabaseAdmin
            .from('products')
            .insert(payload)
            .select()
            .single();
        data = retry.data;
        error = retry.error;
    }

    if (error) throw error;
    res.status(201).json({ data });
});

/** PUT/PATCH /products/:id — update a product. Admin only. */
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let payload = { ...req.body, updated_at: new Date().toISOString() };

    let { data, error } = await supabaseAdmin
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error && error.message?.includes('sort_order')) {
        delete payload.sort_order;
        const retry = await supabaseAdmin
            .from('products')
            .update(payload)
            .eq('id', id)
            .select()
            .single();
        data = retry.data;
        error = retry.error;
    }

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Product not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /products/:id — delete a product. Admin only. Cascades to variants/images/etc. */
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});

// ── product_variants (nested under /products/:productId/variants) ─────────

/** GET /products/:productId/variants — list variants for a product. */
export const listProductVariants = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { data, error } = await supabaseAdmin
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ data });
});

/** GET /products/:productId/variants/:id — single variant. */
export const getProductVariant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('product_variants')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Variant not found.' });
        throw error;
    }
    res.json({ data });
});

/** POST /products/:productId/variants — create a variant. Admin only. */
export const createProductVariant = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let payload = { ...req.body, product_id: productId };
    let { data, error } = await supabaseAdmin
        .from('product_variants')
        .insert(payload)
        .select()
        .single();

    while (error && error.message?.includes('column')) {
        const missingMatch = error.message.match(/column '([^']+)'/i) || error.message.match(/'([^']+)' column/i);
        if (missingMatch && missingMatch[1]) {
            delete payload[missingMatch[1]];
            const retry = await supabaseAdmin
                .from('product_variants')
                .insert(payload)
                .select()
                .single();
            data = retry.data;
            error = retry.error;
        } else {
            break;
        }
    }

    if (error) throw error;
    res.status(201).json({ data });
});

/** PUT/PATCH /products/:productId/variants/:id — update a variant. Admin only. */
export const updateProductVariant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let payload = { ...req.body, updated_at: new Date().toISOString() };

    let { data, error } = await supabaseAdmin
        .from('product_variants')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    while (error && error.message?.includes('column')) {
        const missingMatch = error.message.match(/column '([^']+)'/i) || error.message.match(/'([^']+)' column/i);
        if (missingMatch && missingMatch[1]) {
            delete payload[missingMatch[1]];
            const retry = await supabaseAdmin
                .from('product_variants')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            data = retry.data;
            error = retry.error;
        } else {
            break;
        }
    }

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Variant not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /products/:productId/variants/:id — delete a variant. Admin only. */
export const deleteProductVariant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('product_variants').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});
