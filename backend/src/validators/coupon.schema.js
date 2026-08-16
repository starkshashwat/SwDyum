// ============================================================================
// validators/coupon.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `coupons`. `used_count` is deliberately excluded from
// create/update schemas — it's system-managed (incremented by
// order/checkout logic elsewhere), not admin input.
// Column source: migrations/v2_normalized_schema/003_commerce.sql
// ============================================================================

import { z } from 'zod';
import { paginationQuerySchema, optionalLongText, positiveInt } from './common.schema.js';

const codeSchema = z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, 'Coupon code may only contain letters, numbers, hyphens, and underscores.')
    .transform((v) => v.toUpperCase());

export const createCouponSchema = z.object({
    code: codeSchema,
    description: optionalLongText(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.coerce.number().positive('Must be greater than zero.'),
    min_order_value: z.coerce.number().min(0).default(0),
    max_uses: positiveInt().nullable().optional(),
    expiry_date: z
        .string()
        .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Must be a valid ISO 8601 datetime.' })
        .nullable()
        .optional(),
    is_active: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const listCouponsQuerySchema = paginationQuerySchema.extend({
    is_active: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});
