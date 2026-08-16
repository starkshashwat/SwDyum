// ============================================================================
// validators/auth.schema.js
// ----------------------------------------------------------------------------
// Zod schemas for auth.routes.js (login).
// ============================================================================

import { z } from 'zod';

/** POST /auth/login body schema. */
export const loginSchema = z.object({
    email: z.string().email({ message: 'Must be a valid email address.' }).max(300),
    password: z.string().min(1, 'Password is required.').max(200),
});
