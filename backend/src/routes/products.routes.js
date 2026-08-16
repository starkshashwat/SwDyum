// ============================================================================
// routes/products.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `products` and nested `product_variants`
// (/products/:productId/variants — see products.controller.js header
// comment for the nesting rationale).
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    createProductSchema,
    updateProductSchema,
    listProductsQuerySchema,
    createProductVariantSchema,
    updateProductVariantSchema,
} from '../validators/product.schema.js';
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    listProductVariants,
    getProductVariant,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
} from '../controllers/products.controller.js';

const router = Router();

// ── Public reads ─────────────────────────────────────────────────────────────
router.get('/', optionalAuth, validate(listProductsQuerySchema, 'query'), listProducts);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getProduct);
router.get('/:productId/variants', optionalAuth, listProductVariants);
router.get('/:productId/variants/:id', optionalAuth, getProductVariant);

// ── Admin writes: products ──────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, validate(createProductSchema), createProduct);
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateProductSchema), updateProduct);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateProductSchema), updateProduct);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteProduct);

// ── Admin writes: nested variants ───────────────────────────────────────────
router.post(
    '/:productId/variants',
    requireAuth,
    requireAdmin,
    validate(createProductVariantSchema),
    createProductVariant
);
router.put(
    '/:productId/variants/:id',
    requireAuth,
    requireAdmin,
    validate(updateProductVariantSchema),
    updateProductVariant
);
router.patch(
    '/:productId/variants/:id',
    requireAuth,
    requireAdmin,
    validate(updateProductVariantSchema),
    updateProductVariant
);
router.delete('/:productId/variants/:id', requireAuth, requireAdmin, deleteProductVariant);

export default router;
