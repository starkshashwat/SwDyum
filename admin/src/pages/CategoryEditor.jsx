// ============================================================================
// pages/CategoryEditor.jsx
// ----------------------------------------------------------------------------
// Create/edit screen for a single category, wired to the backend's
// /api/categories endpoints (backend/src/validators/category.schema.js):
//   { slug, name, description?, banner_url?, is_active, sort_order }
// Also manages the nested `category_pairings` sub-resource
// (/api/categories/:categoryId/pairings) — label + icon (emoji) + sort_order.
//
// NOTE: The legacy version of this page had `seo_title`/`seo_description`
// fields that do NOT exist in the new `categories` table/schema (see
// migrations/v2_normalized_schema/001_categories_products.sql) — they have
// been removed here since the backend would reject them silently (zod
// `.partial()` schemas simply drop unknown keys, but there's no column to
// persist them into). If SEO fields are needed later, they must first be
// added to the categories table + category.schema.js on the backend.
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { apiClient, ApiError } from '../lib/apiClient';
import ImageUpload from '../components/shared/ImageUpload';
import EmojiPicker from '../components/shared/EmojiPicker';

export default function CategoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    banner_url: '',
    is_active: true,
    sort_order: 0,
  });

  // Pairings are managed separately since they're a nested sub-resource with
  // their own endpoints — new pairings (no `id` yet) are created on save,
  // existing ones are updated/deleted individually via their own id.
  const [pairings, setPairings] = useState([]);
  const [pairingsLoading, setPairingsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/categories/${id}`);
      const data = response?.data;
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        banner_url: data.banner_url || '',
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
      });
      setPairings(data.category_pairings || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Category not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Auto-generate slug from name only while creating a new category.
      ...(name === 'name' &&
        !isEditing && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      banner_url: formData.banner_url || undefined,
      is_active: formData.is_active,
      sort_order: Number(formData.sort_order) || 0,
    };

    try {
      let categoryId = id;
      if (isEditing) {
        await apiClient.put(`/categories/${id}`, payload);
      } else {
        const response = await apiClient.post('/categories', payload);
        categoryId = response?.data?.id;
      }

      // Persist any pending pairing changes now that we have a category id.
      await Promise.all(
        pairings.map((pairing) => {
          const pairingPayload = {
            label: pairing.label,
            icon: pairing.icon || undefined,
            sort_order: Number(pairing.sort_order) || 0,
          };
          if (pairing._deleted && pairing.id) {
            return apiClient.delete(`/categories/${categoryId}/pairings/${pairing.id}`);
          }
          if (pairing.id) {
            return apiClient.put(`/categories/${categoryId}/pairings/${pairing.id}`, pairingPayload);
          }
          if (!pairing.label) return Promise.resolve(); // skip empty new rows
          return apiClient.post(`/categories/${categoryId}/pairings`, pairingPayload);
        })
      );

      navigate('/categories');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details?.fieldErrors) setFieldErrors(err.details.fieldErrors);
      } else {
        setError('Failed to save category.');
      }
    } finally {
      setSaving(false);
    }
  };

  const addPairing = () => {
    setPairings((prev) => [...prev, { label: '', icon: '', sort_order: prev.length }]);
  };

  const updatePairing = (index, field, value) => {
    setPairings((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const removePairing = (index) => {
    setPairings((prev) => {
      const target = prev[index];
      // Existing (persisted) pairings are soft-marked for deletion on save;
      // brand-new unsaved rows are just spliced out immediately.
      if (target.id) {
        return prev.map((p, i) => (i === index ? { ...p, _deleted: true } : p));
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading category...</div>;
  }

  const visiblePairings = pairings.filter((p) => !p._deleted);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/categories" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Category' : 'Create Category'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? `Editing /${formData.slug}` : 'Add a new product category'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                placeholder="e.g. Mango Pickles"
              />
              {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">URL Slug *</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm bg-gray-50"
                placeholder="e.g. mango-pickles"
              />
              {fieldErrors.slug && <p className="text-xs text-red-600">{fieldErrors.slug.join(', ')}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
              placeholder="Describe this category for your customers..."
            />
          </div>

          <ImageUpload
            label="Banner Image"
            value={formData.banner_url}
            onUploaded={(url) => setFormData((prev) => ({ ...prev, banner_url: url || '' }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                min="0"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
              />
              <p className="text-xs text-gray-500">Lower values appear first in storefront navigation.</p>
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (visible on storefront)
              </label>
            </div>
          </div>
        </div>

        {/* Pairings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">Food Pairings</h2>
            <button
              type="button"
              onClick={addPairing}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Pairing
            </button>
          </div>
          <p className="text-xs text-gray-500">e.g. "Pairs well with Dal" chips shown on the category page.</p>

          {visiblePairings.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No pairings added yet.</p>
          ) : (
            <div className="space-y-3">
              {pairings.map((pairing, index) =>
                pairing._deleted ? null : (
                  <div key={pairing.id || `new-${index}`} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <EmojiPicker value={pairing.icon} onSelect={(emoji) => updatePairing(index, 'icon', emoji)} />
                    <input
                      type="text"
                      value={pairing.label}
                      onChange={(e) => updatePairing(index, 'label', e.target.value)}
                      placeholder="Pairing label, e.g. Steamed Rice"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                    <input
                      type="number"
                      value={pairing.sort_order}
                      onChange={(e) => updatePairing(index, 'sort_order', e.target.value)}
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                      title="Sort order"
                    />
                    <button
                      type="button"
                      onClick={() => removePairing(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link
            to="/categories"
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isEditing ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
