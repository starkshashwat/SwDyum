// ============================================================================
// controllers/reviews.controller.js
// ----------------------------------------------------------------------------
// Read + moderation controller for `product_reviews` (the canonical writable
// table — `reviews` is a read-only compat VIEW and is NEVER queried or
// written to here).
//
// ASSUMPTION / rationale for omitting admin POST: reviews are created by
// customers via the public storefront (Phase 6 frontend), typically tied to
// a verified purchase and their own auth session (customer_id = auth.uid()).
// An admin-side POST would require fabricating a customer_id or allowing
// nulls, which risks polluting review authenticity/analytics. If admin-
// authored reviews are needed later (e.g. seeding, editorial content), add
// a narrowly-scoped POST /reviews with an explicit `is_admin_authored` flag
// — deliberately not added now to avoid conflating admin and customer
// review provenance.
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';

/**
 * GET /reviews
 * Admin sees ALL reviews including unapproved (is_approved=FALSE), unlike
 * the public-facing view which would only show approved ones. Supports
 * filtering by product_id, is_approved, is_featured.
 */
export const listReviews = asyncHandler(async (req, res) => {
    const { page, limit, product_id, is_approved, is_featured } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await resilientQuery(supabaseAdmin, {
        table: 'product_reviews',
        select: '*, products(id, name, slug)',
        order: 'created_at',
        ascending: false,
        range: [from, to],
        count: true,
        filters: (q) => {
            if (product_id) q = q.eq('product_id', product_id);
            if (is_approved !== undefined) q = q.eq('is_approved', is_approved);
            if (is_featured !== undefined) q = q.eq('is_featured', is_featured);
            return q;
        },
    });

    if (error) throw error;
    res.json({ data: data || [], pagination: { page, limit, total: count || 0 } });
});

/** GET /reviews/:id — single review (admin can view unapproved). */
export const getReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('product_reviews')
        .select('*, products(id, name, slug)')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Review not found.' });
        throw error;
    }
    res.json({ data });
});

/**
 * PATCH /reviews/:id — moderation only. Admin toggles is_approved and/or
 * is_featured (validated by moderateReviewSchema — no other fields
 * accepted, preventing admins from silently rewriting customer-authored
 * rating/comment content).
 */
export const moderateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('product_reviews')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Review not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /reviews/:id — delete a review. Admin only. */
export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('product_reviews').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});
