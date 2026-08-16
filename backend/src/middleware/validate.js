// ============================================================================
// middleware/validate.js
// ----------------------------------------------------------------------------
// Generic request-validation middleware factory built on top of zod. Every
// POST/PUT/PATCH route (and any GET route with meaningful query params)
// uses this to validate req.body / req.query / req.params against a zod
// schema BEFORE the controller runs, ensuring controllers can trust the
// shape/types of the data they receive.
//
// On validation failure, responds 400 with field-level error details via
// zod's `.flatten()`, e.g.:
//   { "error": "Validation failed", "details": { "fieldErrors": {...}, "formErrors": [...] } }
//
// On success, the PARSED (and therefore coerced/defaulted) data replaces
// the original req.body/query/params, so controllers always see
// zod-normalized values (e.g. numeric strings coerced to numbers where the
// schema uses z.coerce.number()).
import { logger } from '../utils/logger.js';

/**
 * validate(schema, source = 'body')
 * @param {import('zod').ZodSchema} schema - the zod schema to validate against.
 * @param {'body'|'query'|'params'} [source='body'] - which part of the
 *        request to validate.
 * @returns {Function} Express middleware (req, res, next).
 */
export function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const flatten = result.error.flatten();
            logger.warn(`Validation failed for ${req.method} ${req.originalUrl || req.url}`, {
                fieldErrors: flatten.fieldErrors,
                formErrors: flatten.formErrors,
                body: req[source],
            });
            return res.status(400).json({
                error: 'Validation failed',
                details: flatten,
            });
        }

        // Replace with the parsed/coerced/defaulted data so downstream
        // controllers work with normalized values.
        req[source] = result.data;
        return next();
    };
}
