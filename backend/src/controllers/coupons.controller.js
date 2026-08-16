// ============================================================================
// controllers/coupons.controller.js
// ----------------------------------------------------------------------------
// CRUD controller for `coupons`. `used_count` is never accepted from the
// client (see validators/coupon.schema.js) — it's system-managed by
// checkout logic elsewhere and simply passed through untouched on updates.
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';

/** GET /coupons — paginated, searchable (by code), filterable (is_active) list. */
export const listCoupons = asyncHandler(async (req, res) => {
    const { page, limit, search, is_active } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await resilientQuery(supabaseAdmin, {
        table: 'coupons',
        select: '*',
        order: 'created_at',
        ascending: false,
        range: [from, to],
        count: true,
        filters: (q) => {
            if (search) q = q.ilike('code', `%${search}%`);
            if (is_active !== undefined) q = q.eq('is_active', is_active);
            return q;
        },
    });
    if (error) throw error;
    res.json({ data: data || [], pagination: { page, limit, total: count || 0 } });
});

/** GET /coupons/:id — single coupon. */
export const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'coupons',
        select: '*',
        single: true,
        filters: (q) => q.eq('id', id),
    });
    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Coupon not found.' });
        throw error;
    }
    res.json({ data });
});

/** POST /coupons — create a coupon. Admin only. */
export const createCoupon = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('coupons').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ data });
});

/** PUT/PATCH /coupons/:id — update a coupon. Admin only. used_count is never touched here. */
export const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('coupons')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Coupon not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /coupons/:id — delete a coupon. Admin only. */
export const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});
