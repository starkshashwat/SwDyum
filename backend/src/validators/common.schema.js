// ============================================================================
// validators/common.schema.js
// ----------------------------------------------------------------------------
// Shared zod helpers reused across every entity-specific schema file:
//   - noScriptTag: a .refine() check rejecting obvious `<script` tags in
//     free-text fields as defense-in-depth (the real XSS protection is
//     output-side sanitization/escaping, but rejecting obvious injection
//     attempts at the API boundary costs nothing and catches lazy attacks).
//   - paginationQuerySchema: the common `?page=&limit=&search=` shape used
//     by every list endpoint, with defaults (page=1, limit=20) and a hard
//     cap (max limit=100).
//   - uuidSchema: a reusable UUID param/field validator.
// ============================================================================

import { z } from 'zod';

/**
 * Rejects strings containing an opening `<script` tag (case-insensitive).
 * This is defense-in-depth only — never a substitute for proper output
 * encoding/sanitization when rendering user-supplied content.
 */
export const noScriptTag = (value) => !/<script/i.test(value ?? '');

/** Reusable UUID validator (used for :id route params and FK fields). */
export const uuidSchema = z.string().uuid({ message: 'Must be a valid UUID.' });

/** Reusable route-param schema for a single `:id` param (accepts UUIDs and synthetic IDs). */
export const idParamSchema = z.object({
    id: z.string().min(1, 'ID must be non-empty.'),
});

/**
 * Common pagination + search query schema. Individual entity list schemas
 * extend/merge this with entity-specific filters (e.g. category_id, status).
 * Uses z.coerce.number() since query string values arrive as strings.
 */
export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(200).optional(),
});

/** Required short free-text field. */
export const requiredShortText = () =>
    z
        .string()
        .min(1, 'This field is required.')
        .max(500, 'Must be 500 characters or fewer.')
        .refine(noScriptTag, { message: 'Field must not contain script tags.' });

/** Optional short free-text field (nullable/undefined allowed). */
export const optionalShortText = () =>
    z
        .string()
        .max(500, 'Must be 500 characters or fewer.')
        .refine(noScriptTag, { message: 'Field must not contain script tags.' })
        .nullable()
        .optional();

/** Required long free-text field (e.g. descriptions, answers). Max 5000 chars. */
export const requiredLongText = () =>
    z
        .string()
        .min(1, 'This field is required.')
        .max(5000, 'Must be 5000 characters or fewer.')
        .refine(noScriptTag, { message: 'Field must not contain script tags.' });

/** Optional long free-text field. */
export const optionalLongText = () =>
    z
        .string()
        .max(5000, 'Must be 5000 characters or fewer.')
        .refine(noScriptTag, { message: 'Field must not contain script tags.' })
        .nullable()
        .optional();

/** Optional URL or relative asset path field (banner_url, image_url, etc.). */
export const optionalUrl = () =>
    z
        .string()
        .max(2000, 'URL must be 2000 characters or fewer.')
        .refine((val) => !val || val.startsWith('/') || /^https?:\/\//i.test(val), {
            message: 'Must be a valid URL or relative asset path starting with /',
        })
        .nullable()
        .optional();

/** Non-negative numeric field with 2 decimal precision (money columns). */
export const nonNegativeMoney = () =>
    z.coerce.number().min(0, 'Must be zero or greater.');

/** Positive integer (e.g. quantity, sort_order where >0 required). */
export const positiveInt = () => z.coerce.number().int().positive();

/** Non-negative integer (e.g. stock_quantity, sort_order, display_order). */
export const nonNegativeInt = () => z.coerce.number().int().min(0);
