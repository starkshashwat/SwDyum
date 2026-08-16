// ============================================================================
// controllers/productImages.controller.js
// ----------------------------------------------------------------------------
// Top-level route file (per required file structure) for `product_images`,
// scoped by `product_id` via query param (list) or body/route (create).
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';

/** GET /product-images?product_id=... — paginated list, optionally scoped to a product. */
export const listProductImages = asyncHandler(async (req, res) => {
    const { page, limit, product_id } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await resilientQuery(supabaseAdmin, {
        table: 'product_images',
        select: '*',
        order: 'display_order',
        ascending: true,
        range: [from, to],
        count: true,
        filters: (q) => {
            if (product_id) q = q.eq('product_id', product_id);
            return q;
        },
    });
    if (error) throw error;
    res.json({ data: data || [], pagination: { page, limit, total: count || 0 } });
});

/** GET /product-images/:id — single image. */
export const getProductImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'product_images',
        select: '*',
        single: true,
        filters: (q) => q.eq('id', id),
    });
    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Image not found.' });
        throw error;
    }
    res.json({ data });
});

/** POST /product-images — create an image record. Admin only. Requires product_id in body. */
export const createProductImage = asyncHandler(async (req, res) => {
    let payload = { ...req.body };
    let { data, error } = await supabaseAdmin.from('product_images').insert(payload).select().single();

    while (error && error.message?.includes('column')) {
        const missingMatch = error.message.match(/column '([^']+)'/i) || error.message.match(/'([^']+)' column/i);
        if (missingMatch && missingMatch[1]) {
            delete payload[missingMatch[1]];
            const retry = await supabaseAdmin.from('product_images').insert(payload).select().single();
            data = retry.data;
            error = retry.error;
        } else {
            break;
        }
    }

    if (error) throw error;
    res.status(201).json({ data });
});

/** PUT/PATCH /product-images/:id — update an image record. Admin only. */
export const updateProductImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let payload = { ...req.body };
    let { data, error } = await supabaseAdmin
        .from('product_images')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    while (error && error.message?.includes('column')) {
        const missingMatch = error.message.match(/column '([^']+)'/i) || error.message.match(/'([^']+)' column/i);
        if (missingMatch && missingMatch[1]) {
            delete payload[missingMatch[1]];
            const retry = await supabaseAdmin
                .from('product_images')
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
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Image not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /product-images/:id — delete an image record. Admin only. */
export const deleteProductImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('product_images').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});
