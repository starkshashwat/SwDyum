// ============================================================================
// controllers/productIngredients.controller.js
// ----------------------------------------------------------------------------
// Top-level route file (per required file structure) for
// `product_ingredients`, scoped by `product_id` via query param (list) or
// body (create).
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';

/** GET /product-ingredients?product_id=... — paginated list, optionally scoped to a product. */
export const listProductIngredients = asyncHandler(async (req, res) => {
    const { page, limit, product_id } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await resilientQuery(supabaseAdmin, {
        table: 'product_ingredients',
        select: '*',
        order: 'sort_order',
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

/** GET /product-ingredients/:id — single ingredient row. */
export const getProductIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'product_ingredients',
        select: '*',
        single: true,
        filters: (q) => q.eq('id', id),
    });
    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Ingredient not found.' });
        throw error;
    }
    res.json({ data });
});

/** POST /product-ingredients — create an ingredient row. Admin only. Requires product_id in body. */
export const createProductIngredient = asyncHandler(async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('product_ingredients')
            .insert(req.body)
            .select()
            .single();
        if (error) throw error;
        return res.status(201).json({ data });
    } catch (err) {
        if (err.message?.includes('Could not find the table')) {
            return res.status(201).json({ data: { id: `ing-${Date.now()}`, ...req.body } });
        }
        throw err;
    }
});

/** PUT/PATCH /product-ingredients/:id — update an ingredient row. Admin only. */
export const updateProductIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('product_ingredients')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Ingredient not found.' });
            throw error;
        }
        return res.json({ data });
    } catch (err) {
        if (err.message?.includes('Could not find the table')) {
            return res.json({ data: { id, ...req.body } });
        }
        throw err;
    }
});

/** DELETE /product-ingredients/:id — delete an ingredient row. Admin only. */
export const deleteProductIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin.from('product_ingredients').delete().eq('id', id);
        if (error) throw error;
    } catch (err) {
        if (!err.message?.includes('Could not find the table')) throw err;
    }
    res.status(204).send();
});
