// ============================================================================
// validators/review.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `product_reviews`. Admin API only supports moderation
// (PATCH is_approved/is_featured) and DELETE — no admin POST (reviews are
// created by customers via the public frontend elsewhere; see README.md
// "Assumptions" section for full rationale).
// Column source: migrations/v2_normalized_schema/003_commerce.sql
// ============================================================================

import { z } from 'zod';
import { paginationQuerySchema, uuidSchema } from './common.schema.js';

/**
 * PATCH /reviews/:id body schema — moderation only. Admin may toggle
 * is_approved and/or is_featured. Both optional so a partial patch (just
 * one flag) is valid.
 */
export const moderateReviewSchema = z.object({
    is_approved: z.boolean().optional(),
    is_featured: z.boolean().optional(),
});

/** GET /reviews query schema — pagination + product_id + is_approved filter. */
export const listReviewsQuerySchema = paginationQuerySchema.extend({
    product_id: uuidSchema.optional(),
    is_approved: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
    is_featured: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});
