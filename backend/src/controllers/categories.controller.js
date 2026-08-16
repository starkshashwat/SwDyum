// ============================================================================
// controllers/categories.controller.js
// ----------------------------------------------------------------------------
// CRUD controller for `categories` and nested `category_pairings`.
//
// Nesting decision (documented per task instructions): category_pairings
// are exposed as a NESTED resource under /categories/:categoryId/pairings
// rather than a top-level route. Rationale: pairings have no independent
// existence or identity outside their parent category (they are simple
// label+icon chips shown on a category page), so nesting keeps the route
// tree self-documenting and avoids a stray top-level /pairings endpoint
// that would need its own category_id filter anyway.
//
// All writes use supabaseAdmin (service-role, bypasses RLS) since these
// routes are mounted behind requireAuth + requireAdmin. Public list/read
// endpoints use supabaseAdmin too for simplicity but are mounted WITHOUT
// auth middleware (see routes/categories.routes.js) — they still filter to
// is_active=TRUE by default the way public RLS would, to avoid leaking
// draft/inactive categories through the admin API to anonymous callers.
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /categories
 * Paginated, searchable, filterable list of categories.
 * Query: page, limit, search (matches name/slug), is_active.
 */
export const listCategories = asyncHandler(async (req, res) => {
    const { page, limit, search, is_active } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // The migration may not have been run yet, so both `category_pairings`
    // (join) and `sort_order` (column) may be missing. We try the ideal
    // query first and progressively fall back.
    let selectExpr = '*, category_pairings(*)';
    let orderCol = 'sort_order';
    let pairingsFallback = false;

    const buildQuery = () => {
        let q = supabaseAdmin
            .from('categories')
            .select(selectExpr, { count: 'exact' })
            .order(orderCol, { ascending: true })
            .range(from, to);
        if (search) q = q.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
        if (is_active !== undefined) q = q.eq('is_active', is_active);
        return q;
    };

    let { data, error, count } = await buildQuery();

    // Retry without category_pairings join if that relationship is missing.
    if (error && error.message?.includes('category_pairings')) {
        selectExpr = '*';
        pairingsFallback = true;
        ({ data, error, count } = await buildQuery());
    }

    // Retry without sort_order if that column is missing.
    if (error && error.message?.includes('sort_order')) {
        orderCol = 'created_at';
        ({ data, error, count } = await buildQuery());
    }

    if (error) throw error;

    // Add empty pairings array for frontend compatibility when join was skipped.
    if (pairingsFallback) {
        data = (data || []).map(c => ({ ...c, category_pairings: [] }));
    }

    res.json({ data, pagination: { page, limit, total: count } });
});

/** GET /categories/:id — single category with nested pairings. */
export const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let { data, error } = await supabaseAdmin
        .from('categories')
        .select('*, category_pairings(*)')
        .eq('id', id)
        .single();

    if (error && error.message?.includes('category_pairings')) {
        // category_pairings table or FK relationship missing — retry without join.
        ({ data, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .eq('id', id)
            .single());
        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Category not found.' });
            throw error;
        }
        data = { ...data, category_pairings: [] };
    } else if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Category not found.' });
        throw error;
    }
    res.json({ data });
});

/** POST /categories — create a new category. Admin only. */
export const createCategory = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert(req.body)
        .select()
        .single();

    if (error) throw error;
    res.status(201).json({ data });
});

/** PUT/PATCH /categories/:id — update a category. Admin only. */
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('categories')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Category not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /categories/:id — delete a category. Admin only. */
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});

// ── category_pairings (nested) ──────────────────────────────────────────────

/** GET /categories/:categoryId/pairings — list pairings for a category. */
export const listCategoryPairings = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { data, error } = await supabaseAdmin
        .from('category_pairings')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ data });
});

/** POST /categories/:categoryId/pairings — create a pairing. Admin only. */
export const createCategoryPairing = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { data, error } = await supabaseAdmin
        .from('category_pairings')
        .insert({ ...req.body, category_id: categoryId })
        .select()
        .single();

    if (error) throw error;
    res.status(201).json({ data });
});

/** PUT/PATCH /categories/:categoryId/pairings/:id — update a pairing. Admin only. */
export const updateCategoryPairing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('category_pairings')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Pairing not found.' });
        throw error;
    }
    res.json({ data });
});

/** DELETE /categories/:categoryId/pairings/:id — delete a pairing. Admin only. */
export const deleteCategoryPairing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('category_pairings').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});
