// ============================================================================
// validators/productImage.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `product_images`.
// Column source: migrations/v2_normalized_schema/001_categories_products.sql
// ============================================================================

import { z } from 'zod';
import {
    paginationQuerySchema,
    optionalShortText,
    nonNegativeInt,
    uuidSchema,
    optionalUrl,
} from './common.schema.js';

export const createProductImageSchema = z.object({
    product_id: uuidSchema.optional(), // supplied via route param typically
    url: z
        .string()
        .max(2000, 'URL must be 2000 characters or fewer.')
        .refine((val) => !val || val.startsWith('/') || /^https?:\/\//i.test(val), {
            message: 'Must be a valid URL or relative asset path starting with /',
        }),
    alt_text: optionalShortText(),
    display_order: nonNegativeInt().default(0),
});

export const updateProductImageSchema = z.object({
    url: optionalUrl(),
    alt_text: optionalShortText(),
    display_order: nonNegativeInt().optional(),
});

export const listProductImagesQuerySchema = paginationQuerySchema.extend({
    product_id: uuidSchema.optional(),
});
