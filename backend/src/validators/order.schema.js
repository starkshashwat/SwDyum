// ============================================================================
// validators/order.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `orders`. Per the task's canonical rule: orders are NEVER
// admin-creatable via this API (they originate from checkout/webhooks
// elsewhere) — so there is deliberately NO createOrderSchema. Only a query
// schema (list filters) and an update schema (status/tracking/payment
// fields only) are exported.
// Column source: migrations/v2_normalized_schema/003_commerce.sql
// ============================================================================

import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

/** Matches the CHECK constraint on orders.status. */
const orderStatusEnum = z.enum([
    'Pending',
    'Paid',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Failed',
    'Refunded',
]);

/** Matches the CHECK constraint on orders.payment_status. */
const paymentStatusEnum = z.enum(['Pending', 'Paid', 'Failed', 'Refunded']);

/** Shape of a single tracking_history entry (orders.tracking_history JSONB array). */
const trackingHistoryEntrySchema = z.object({
    status: z.string().max(200),
    timestamp: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
        message: 'timestamp must be a valid ISO 8601 datetime.',
    }),
    note: z.string().max(1000).optional(),
});

/**
 * PATCH /orders/:id body schema. Allows updating status, tracking_number,
 * tracking_history, payment_status, and customer contact/shipping address details.
 */
export const updateOrderSchema = z.object({
    status: orderStatusEnum.optional(),
    payment_status: paymentStatusEnum.optional(),
    tracking_number: z.string().max(200).nullable().optional(),
    tracking_history: z.array(trackingHistoryEntrySchema).optional(),
    // Server-side append: { status?, note? } — the controller merges it into
    // tracking_history so concurrent updates can't overwrite each other.
    tracking_entry: z.object({
        status: z.string().max(100).optional(),
        note: z.string().max(2000).optional(),
    }).optional(),
    customer_name: z.string().max(200).optional(),
    customer_phone: z.string().max(50).optional(),
    customer_email: z.string().email().optional(),
    shipping_address: z.record(z.any()).optional(),
    shipping_details: z.record(z.any()).optional(),
});

/** GET /orders query schema — pagination + status/customer_email/date-range filters. */
export const listOrdersQuerySchema = paginationQuerySchema.extend({
    status: orderStatusEnum.optional(),
    payment_status: paymentStatusEnum.optional(),
    customer_email: z.string().max(300).optional(),
    date_from: z
        .string()
        .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'date_from must be a valid ISO 8601 datetime.' })
        .optional(),
    date_to: z
        .string()
        .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'date_to must be a valid ISO 8601 datetime.' })
        .optional(),
});
