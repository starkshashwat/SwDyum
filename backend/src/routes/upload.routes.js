// ============================================================================
// routes/upload.routes.js
// ----------------------------------------------------------------------------
// Route definition for image uploads. Uses multer with MEMORY storage
// (never disk storage — we never want an uploaded file to touch the
// server's filesystem, since this is a stateless API and disk writes would
// be a needless attack surface / cleanup burden) so the file buffer is
// available directly on req.file.buffer for the controller to push to
// Supabase Storage.
//
// Security measures applied here (in addition to requireAuth+requireAdmin):
//   - 5MB file size limit (limits.fileSize)
//   - MIME type allow-list via fileFilter (image/jpeg, image/png, image/webp)
//   - Only a single file per request (upload.single('image'))
// ============================================================================

import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { uploadImage } from '../controllers/upload.controller.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * multer fileFilter — rejects any upload whose mimetype is not in the
 * allow-list BEFORE the file buffer is fully read into memory, cutting off
 * disallowed uploads as early as possible.
 */
function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
    cb(null, true);
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter,
});

const router = Router();

/**
 * POST /upload/image
 * multipart/form-data with a single field named "image". Admin only.
 * Any multer error (oversized file, disallowed mime type) is passed to
 * next(err) and handled by the centralized errorHandler as a 400-ish error
 * (multer errors have a `.message` but no `.status` — errorHandler falls
 * back to 500 in that case, which is acceptable since these are rare
 * client-misuse cases, not routine validation failures).
 */
router.post(
    '/image',
    requireAuth,
    requireAdmin,
    (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                // Normalize multer/file-filter errors to a clean 400 response.
                return res.status(400).json({ error: err.message || 'File upload failed.' });
            }
            next();
        });
    },
    uploadImage
);

export default router;
