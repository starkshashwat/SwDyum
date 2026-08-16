// ============================================================================
// validators/product.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `products` and the nested `product_variants` table.
// Column source: migrations/v2_normalized_schema/001_categories_products.sql
// ============================================================================

import { z } from 'zod';
import {
    paginationQuerySchema,
    requiredShortText,
    optionalLongText,
    nonNegativeInt,
    nonNegativeMoney,
    uuidSchema,
} from './common.schema.js';

const slugSchema = z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only.');

/**
 * pdp_config is a flexible JSONB blob (see products.pdp_config comment in
 * the SQL migration). We validate it as a generic object (any shape) since
 * its internal structure is intentionally flexible/frontend-driven, but we
 * still require it to be a plain object (not an array or primitive) to
 * catch obvious client mistakes.
 */
const pdpConfigSchema = z.record(z.any()).default({});

/** POST /products body schema. */
export const createProductSchema = z.object({
    slug: slugSchema,
    name: requiredShortText(),
    short_description: optionalLongText(),
    description: optionalLongText(),
    category_id: uuidSchema.nullable().optional(),
    pure_ingredients: z.any().optional(),
    pdp_config: pdpConfigSchema,
    is_active: z.boolean().default(true),
    is_bestseller: z.boolean().optional(),
    sort_order: nonNegativeInt().default(0),
});

/** PUT/PATCH /products/:id body schema — partial update. */
export const updateProductSchema = createProductSchema.partial();

/** GET /products query schema — pagination + category_id + is_active filters. */
export const listProductsQuerySchema = paginationQuerySchema.extend({
    category_id: uuidSchema.optional(),
    is_active: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});

// ── product_variants (nested under /products/:productId/variants) ──────────

export const createProductVariantSchema = z
    .object({
        product_id: uuidSchema.optional(), // supplied via route param typically
        weight_label: requiredShortText(),
        price: nonNegativeMoney(),
        mrp: nonNegativeMoney().nullable().optional(),
        stock_quantity: nonNegativeInt().default(0),
        sku: z.string().max(100).nullable().optional(),
        is_active: z.boolean().default(true),
    })
    .refine((data) => data.mrp === undefined || data.mrp === null || data.mrp >= data.price, {
        message: 'mrp must be greater than or equal to price.',
        path: ['mrp'],
    });

export const updateProductVariantSchema = z
    .object({
        weight_label: requiredShortText().optional(),
        price: nonNegativeMoney().optional(),
        mrp: nonNegativeMoney().nullable().optional(),
        stock_quantity: nonNegativeInt().optional(),
        sku: z.string().max(100).nullable().optional(),
        is_active: z.boolean().optional(),
    })
    .refine(
        (data) =>
            data.mrp === undefined ||
            data.mrp === null ||
            data.price === undefined ||
            data.mrp >= data.price,
        {
            message: 'mrp must be greater than or equal to price.',
            path: ['mrp'],
        }
    );
