// ============================================================================
// validators/category.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `categories` and the nested `category_pairings` table.
// Column source: migrations/v2_normalized_schema/001_categories_products.sql
// ============================================================================

import { z } from 'zod';
import {
    paginationQuerySchema,
    requiredShortText,
    optionalShortText,
    optionalLongText,
    optionalUrl,
    nonNegativeInt,
    uuidSchema,
} from './common.schema.js';

/** slug: URL-safe identifier. Lowercase letters, numbers, hyphens only. */
const slugSchema = z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only.');

/** POST /categories body schema — all required-by-DB fields required here. */
export const createCategorySchema = z.object({
    slug: slugSchema,
    name: requiredShortText(),
    description: optionalLongText(),
    banner_url: optionalUrl(),
    is_active: z.boolean().default(true),
    sort_order: nonNegativeInt().default(0),
});

/** PUT/PATCH /categories/:id body schema — every field optional (partial update). */
export const updateCategorySchema = createCategorySchema.partial();

/** GET /categories query schema — pagination + optional is_active filter. */
export const listCategoriesQuerySchema = paginationQuerySchema.extend({
    is_active: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});

// ── category_pairings (nested under /categories/:categoryId/pairings) ──────

export const createCategoryPairingSchema = z.object({
    category_id: uuidSchema.optional(), // supplied via route param, but allow body override for flexibility
    label: requiredShortText(),
    icon: optionalShortText(),
    sort_order: nonNegativeInt().default(0),
});

export const updateCategoryPairingSchema = createCategoryPairingSchema.partial();
