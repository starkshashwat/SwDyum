// ============================================================================
// routes/categories.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `categories` and nested `category_pairings`.
// Public GET (list/read) routes are mounted WITHOUT requireAuth so the
// future public frontend can consume them anonymously (optionalAuth is used
// instead so a logged-in caller's identity is still attached if present).
// All write routes (POST/PUT/PATCH/DELETE) require requireAuth + requireAdmin.
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import {
    createCategorySchema,
    updateCategorySchema,
    listCategoriesQuerySchema,
    createCategoryPairingSchema,
    updateCategoryPairingSchema,
} from '../validators/category.schema.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    listCategoryPairings,
    createCategoryPairing,
    updateCategoryPairing,
    deleteCategoryPairing,
} from '../controllers/categories.controller.js';

const router = Router();

// ── Public reads (optionalAuth: works with or without a token) ─────────────
router.get('/', optionalAuth, validate(listCategoriesQuerySchema, 'query'), listCategories);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getCategory);
router.get('/:categoryId/pairings', optionalAuth, listCategoryPairings);

// ── Admin writes ─────────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), createCategory);
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateCategorySchema), updateCategory);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteCategory);

router.post(
    '/:categoryId/pairings',
    requireAuth,
    requireAdmin,
    validate(createCategoryPairingSchema),
    createCategoryPairing
);
router.put(
    '/:categoryId/pairings/:id',
    requireAuth,
    requireAdmin,
    validate(updateCategoryPairingSchema),
    updateCategoryPairing
);
router.patch(
    '/:categoryId/pairings/:id',
    requireAuth,
    requireAdmin,
    validate(updateCategoryPairingSchema),
    updateCategoryPairing
);
router.delete('/:categoryId/pairings/:id', requireAuth, requireAdmin, deleteCategoryPairing);

export default router;
