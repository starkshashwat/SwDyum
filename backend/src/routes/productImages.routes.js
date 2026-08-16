// ============================================================================
// routes/productImages.routes.js
// ----------------------------------------------------------------------------
// Top-level route file for `product_images` (per required file structure),
// scoped by product_id via query param (?product_id=) for listing, and via
// a required body field for creation.
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    createProductImageSchema,
    updateProductImageSchema,
    listProductImagesQuerySchema,
} from '../validators/productImage.schema.js';
import {
    listProductImages,
    getProductImage,
    createProductImage,
    updateProductImage,
    deleteProductImage,
} from '../controllers/productImages.controller.js';

const router = Router();

router.get('/', optionalAuth, validate(listProductImagesQuerySchema, 'query'), listProductImages);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getProductImage);

router.post('/', requireAuth, requireAdmin, validate(createProductImageSchema), createProductImage);
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateProductImageSchema), updateProductImage);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateProductImageSchema), updateProductImage);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteProductImage);

export default router;
