// ============================================================================
// validators/productIngredient.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `product_ingredients`.
// Column source: migrations/v2_normalized_schema/001_categories_products.sql
// ============================================================================

import { z } from 'zod';
import { paginationQuerySchema, requiredShortText, nonNegativeInt, uuidSchema } from './common.schema.js';

export const createProductIngredientSchema = z.object({
    product_id: uuidSchema.optional(),
    ingredient: requiredShortText(),
    percentage: z.preprocess((val) => (val === '' || val === undefined ? null : val), z.coerce.number().min(0).max(100).nullable().optional()),
    sort_order: nonNegativeInt().default(0),
});

export const updateProductIngredientSchema = createProductIngredientSchema.partial();

export const listProductIngredientsQuerySchema = paginationQuerySchema.extend({
    product_id: uuidSchema.optional(),
});
