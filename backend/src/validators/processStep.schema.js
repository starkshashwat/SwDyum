// ============================================================================
// validators/processStep.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for `product_process_steps`.
// Column source: migrations/v2_normalized_schema/002_content_entities.sql
// ============================================================================

import { z } from 'zod';
import {
    paginationQuerySchema,
    requiredShortText,
    optionalLongText,
    optionalShortText,
    uuidSchema,
    optionalUrl,
} from './common.schema.js';

export const createProcessStepSchema = z.object({
    product_id: uuidSchema.optional(),
    step_number: z.coerce.number().int().optional(),
    title: requiredShortText(),
    description: optionalLongText(),
    desc: optionalLongText(),
    icon: optionalShortText(),
    image_url: optionalUrl(),
    img: optionalUrl(),
    is_active: z.boolean().default(true),
});

export const updateProcessStepSchema = createProcessStepSchema.partial();

export const listProcessStepsQuerySchema = paginationQuerySchema.extend({
    product_id: uuidSchema.optional(),
    is_active: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});
