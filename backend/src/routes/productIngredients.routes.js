// ============================================================================
// routes/productIngredients.routes.js
// ----------------------------------------------------------------------------
// Top-level route file for `product_ingredients` (per required file
// structure), scoped by product_id via query param (?product_id=) for
// listing, and via a required body field for creation.
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    createProductIngredientSchema,
    updateProductIngredientSchema,
    listProductIngredientsQuerySchema,
} from '../validators/productIngredient.schema.js';
import {
    listProductIngredients,
    getProductIngredient,
    createProductIngredient,
    updateProductIngredient,
    deleteProductIngredient,
} from '../controllers/productIngredients.controller.js';

const router = Router();

router.get('/', optionalAuth, validate(listProductIngredientsQuerySchema, 'query'), listProductIngredients);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getProductIngredient);

router.post('/', requireAuth, requireAdmin, validate(createProductIngredientSchema), createProductIngredient);
router.put(
    '/:id',
    requireAuth,
    requireAdmin,
    validate(idParamSchema, 'params'),
    validate(updateProductIngredientSchema),
    updateProductIngredient
);
router.patch(
    '/:id',
    requireAuth,
    requireAdmin,
    validate(idParamSchema, 'params'),
    validate(updateProductIngredientSchema),
    updateProductIngredient
);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteProductIngredient);

export default router;
