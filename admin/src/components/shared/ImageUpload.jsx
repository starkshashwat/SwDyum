// ============================================================================
// components/shared/ImageUpload.jsx
// ----------------------------------------------------------------------------
// Reusable image upload control wired to `POST /api/upload/image`.
//
// Behavior:
//   - Accepts a single image file (click-to-browse or drag & drop).
//   - Client-side validates file type (jpeg/png/webp) and size (<=5MB)
//     BEFORE sending anything to the backend, mirroring the same
//     constraints enforced server-side in backend/src/routes/upload.routes.js
//     (this is a UX nicety only — the backend remains the source of truth
//     and will still reject anything that slips through).
//   - Uploads via `apiClient.upload('/upload/image', formData)` with the
//     multipart field named "image" (required exact field name per the
//     backend route: `upload.single('image')`).
//   - Calls `onUploaded(url)` with the public Supabase Storage URL returned
//     by the backend (`response.data.url`) once the upload succeeds.
//   - Shows a preview of either the existing `value` URL (if provided) or
//     the freshly uploaded image, with a "Remove" control that calls
//     `onUploaded(null)`.
//
// Props:
//   value       {string|null}  Current image URL (for edit forms).
//   onUploaded  {function}     Called with the new URL (or null on removal).
//   label       {string}       Optional label rendered above the control.
//   className   {string}       Optional extra classes for the outer wrapper.
// ============================================================================

import { useRef, useState } from 'react';
import { UploadCloud, X, Loader2, ImageIcon } from 'lucide-react';
import { apiClient, ApiError } from '../../lib/apiClient';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — must match backend/src/routes/upload.routes.js

export default function ImageUpload({ value, onUploaded, label, className = '' }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const validateFile = (file) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return `Unsupported file type: ${file.type || 'unknown'}. Allowed: JPEG, PNG, WEBP.`;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size is 5MB.`;
        }
        return null;
    };

    const handleFile = async (file) => {
        if (!file) return;
        setError('');

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await apiClient.upload('/upload/image', formData);
            onUploaded?.(response?.data?.url || null);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
        // Reset the input so selecting the same file again re-triggers onChange.
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

            {value ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onUploaded?.(null)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`w-32 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${dragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    ) : (
                        <>
                            <UploadCloud className="w-5 h-5 text-gray-400" />
                            <span className="text-[11px] text-gray-500 px-2 text-center">Click or drag image</span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_MIME_TYPES.join(',')}
                onChange={handleInputChange}
                className="hidden"
            />

            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
            {!value && !error && (
                <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> JPEG, PNG or WEBP. Max 5MB.
                </p>
            )}
        </div>
    );
}
