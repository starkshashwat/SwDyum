// ============================================================================
// validators/faq.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `product_faqs`.
// Column source: migrations/v2_normalized_schema/002_content_entities.sql
// ============================================================================

import { z } from 'zod';
import {
    paginationQuerySchema,
    requiredShortText,
    requiredLongText,
    nonNegativeInt,
    uuidSchema,
} from './common.schema.js';

export const createFaqSchema = z.object({
    product_id: uuidSchema.optional(),
    question: requiredShortText(),
    answer: requiredLongText(),
    sort_order: nonNegativeInt().default(0),
    is_active: z.boolean().default(true),
});

export const updateFaqSchema = createFaqSchema.partial();

export const listFaqsQuerySchema = paginationQuerySchema.extend({
    product_id: uuidSchema.optional(),
    is_active: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});
