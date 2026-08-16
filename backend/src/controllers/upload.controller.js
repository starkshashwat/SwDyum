// ============================================================================
// controllers/upload.controller.js
// ----------------------------------------------------------------------------
// Handles image uploads to Supabase Storage. multer (memory storage,
// configured in routes/upload.routes.js) parses the multipart/form-data
// body and attaches the file buffer to req.file — this controller then
// pushes that buffer to the configured Storage bucket using the
// SERVICE-ROLE client (writes to Storage should bypass RLS/storage policies
// the same way our other admin writes do, since this route is already
// gated by requireAuth + requireAdmin before it ever runs).
// ============================================================================

import crypto from 'node:crypto';
import path from 'node:path';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /upload/image
 * Expects a single multipart file field named "image" (see
 * routes/upload.routes.js for the multer field name). Validates presence
 * (multer + fileFilter already rejected disallowed mime types/oversized
 * files before this handler runs — see routes/upload.routes.js), generates
 * a cryptographically random unique filename to avoid any possibility of
 * path traversal or filename collision, uploads the buffer, and returns
 * the bucket's public URL.
 */
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded. Expected a multipart field named "image".' });
    }

    const originalExt = path.extname(req.file.originalname || '').toLowerCase();
    // Fall back to a safe default extension derived from mimetype if the
    // original filename had none (defense-in-depth — we never trust the
    // client-supplied filename directly for the stored path).
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(originalExt)
        ? originalExt
        : `.${req.file.mimetype.split('/')[1] || 'bin'}`;

    const uniqueFilename = `${crypto.randomUUID()}${safeExt}`;

    let { error: uploadError } = await supabaseAdmin.storage
        .from(env.STORAGE_BUCKET_PRODUCT_IMAGES)
        .upload(uniqueFilename, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false, // unique filename means collisions should never happen
        });

    if (uploadError) {
        const errorMsg = uploadError.message || '';
        if (errorMsg.toLowerCase().includes('bucket not found') || uploadError.error === 'Bucket not found') {
            // Attempt to create the bucket dynamically as a fallback
            const { error: createError } = await supabaseAdmin.storage.createBucket(env.STORAGE_BUCKET_PRODUCT_IMAGES, {
                public: true,
            });
            if (!createError) {
                // Retry upload
                const { error: retryError } = await supabaseAdmin.storage
                    .from(env.STORAGE_BUCKET_PRODUCT_IMAGES)
                    .upload(uniqueFilename, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: false,
                    });
                if (retryError) throw retryError;
                uploadError = null;
            } else {
                throw uploadError;
            }
        } else {
            throw uploadError;
        }
    }

    const { data: publicUrlData } = supabaseAdmin.storage
        .from(env.STORAGE_BUCKET_PRODUCT_IMAGES)
        .getPublicUrl(uniqueFilename);

    res.status(201).json({
        data: {
            url: publicUrlData.publicUrl,
            filename: uniqueFilename,
        },
    });
});
