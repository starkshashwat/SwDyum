// ============================================================================
// utils/asyncHandler.js
// ----------------------------------------------------------------------------
// Wraps an async Express route/controller handler so that any rejected
// Promise (thrown error) is automatically forwarded to next(err), letting
// the centralized errorHandler.js middleware deal with it.
//
// Without this wrapper, every single async controller would need a manual
// try/catch that calls next(err) — repetitive and easy to forget. Wrapping
// once here keeps every controller function clean:
//
//   export const listCategories = asyncHandler(async (req, res) => {
//     const { data, error } = await supabaseAdmin.from('categories').select('*');
//     if (error) throw error; // caught below, forwarded to errorHandler
//     res.json({ data });
//   });
// ============================================================================

/**
 * asyncHandler(fn)
 * @param {Function} fn - an async (req, res, next) => {} Express handler.
 * @returns {Function} a new handler that catches rejected promises and
 *                      forwards the error to Express's next() for
 *                      centralized handling.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
