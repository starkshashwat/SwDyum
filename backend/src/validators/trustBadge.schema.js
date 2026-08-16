// ============================================================================
// validators/trustBadge.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `product_trust_badges`.
// Column source: migrations/v2_normalized_schema/002_content_entities.sql
// ============================================================================

import { z } from 'zod';
import {
    paginationQuerySchema,
    requiredShortText,
    optionalLongText,
    nonNegativeInt,
    uuidSchema,
} from './common.schema.js';

export const createTrustBadgeSchema = z.object({
    product_id: uuidSchema.optional(),
    emoji: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    badge_key: z.string().nullable().optional(),
    label: requiredShortText(),
    description: optionalLongText(),
    sort_order: nonNegativeInt().default(0),
    is_active: z.boolean().default(true),
});

export const updateTrustBadgeSchema = createTrustBadgeSchema.partial();

export const listTrustBadgesQuerySchema = paginationQuerySchema.extend({
    product_id: uuidSchema.optional(),
    is_active: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});
