// ============================================================================
// pages/ProductEditor.jsx
// ----------------------------------------------------------------------------
// Create/edit screen for a single product, wired to the backend API:
//
//   Products (backend/src/routes/products.routes.js):
//     GET    /api/products/:id            (returns product + nested
//                                          product_variants, product_images,
//                                          product_ingredients,
//                                          product_trust_badges,
//                                          product_faqs, product_process_steps)
//     POST   /api/products                (create product)
//     PUT    /api/products/:id            (update product)
//
//   Variants — NESTED under the product (backend/src/routes/products.routes.js):
//     POST   /api/products/:productId/variants
//     PUT    /api/products/:productId/variants/:id
//     DELETE /api/products/:productId/variants/:id
//
//   Images / Ingredients / Trust Badges / FAQs / Process Steps — FLAT
//   top-level resources scoped by product_id (see backend/src/server.js):
//     /api/product-images      { product_id, url, alt_text, display_order }
//     /api/product-ingredients { product_id, ingredient, percentage, sort_order }
//     /api/trust-badges        { product_id, emoji, label, description,
//                                sort_order, is_active }
//     /api/faqs                { product_id, question, answer, sort_order,
//                                is_active }
//     /api/process-steps       { product_id, step_number, title, description,
//                                icon, is_active }
//
//   Categories (for the category dropdown):
//     GET    /api/categories?limit=100
//
//   Upload (for product images via the shared ImageUpload component):
//     POST   /api/upload/image   -> { data: { url } }
//
// Field shapes mirror the zod schemas in backend/src/validators/*.schema.js.
// `pdp_config` is a flexible JSONB blob (validated as z.record(z.any()) on the
// backend) — we expose a raw JSON textarea for the frontend-specific bits
// (taste_profile metrics/pairings, tabs, hero_ingredients_v2, ingredients_table)
// since those don't have dedicated backend tables. The dedicated nested tables
// (product_ingredients, product_faqs) supersede the old pdp_config equivalents.
//
// The legacy version of this page used direct Supabase calls and carried many
// fields that no longer exist in the v2 normalized schema (short_description,
// is_bestseller, seo_*, base_price, cost_price, pure_ingredients as an array,
// images with is_primary, etc.). All of those have been removed here.
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon,
} from 'lucide-react';
import { apiClient, ApiError } from '../lib/apiClient';
import ImageUpload from '../components/shared/ImageUpload';
import EmojiPicker from '../components/shared/EmojiPicker';
import RichTextEditor from '../components/shared/RichTextEditor';

// Tabs shown in the editor. The "Content" tab covers the flexible pdp_config
// JSON blob; the other tabs map 1:1 to dedicated nested backend resources.
const TABS = [
  { key: 'basic', label: 'Basic' },
  { key: 'variants', label: 'Variants' },
  { key: 'images', label: 'Images' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'trustBadges', label: 'Trust Badges' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'processSteps', label: 'Process Steps' },
  { key: 'content', label: 'Additional Details' },
];

const EMPTY_PDP_CONFIG = {
  taste_profile: { metrics: [], pairings: [] },
  tabs: { nutrition: '', storage: '', shipping: '' },
  hero_ingredients_v2: [],
  ingredients_table: [],
};

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    is_active: true,
    sort_order: 0,
  });

  // pdp_config is a flexible JSONB blob. We keep it as a JS object for the
  // taste_profile/tabs/hero_ingredients_v2/ingredients_table sub-structures
  // (edited via dedicated UI) and also expose a raw JSON textarea for any
  // additional freeform keys.
  const [pdpConfig, setPdpConfig] = useState(EMPTY_PDP_CONFIG);
  const [pdpConfigRaw, setPdpConfigRaw] = useState('');
  const [pdpRawError, setPdpRawError] = useState('');

  // Nested sub-resources. Each item may carry an `id` (persisted) or not
  // (new). Persisted items removed in the UI are soft-marked `_deleted: true`
  // and deleted via their own endpoint on save; new unsaved items are just
  // spliced out of local state immediately.
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [trustBadges, setTrustBadges] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchProduct();
  }, [id]);

  // ------------------------------------------------------------------
  // Data fetching
  // ------------------------------------------------------------------
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories', { limit: 100 });
      setCategories(res?.data || []);
    } catch {
      // Non-fatal — the category dropdown will just be empty.
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/products/${id}`);
      const data = res?.data || {};
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        short_description: data.short_description || '',
        description: data.description || '',
        category_id: data.category_id || '',
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
      });
      setVariants(data.product_variants || []);
      setImages(data.product_images || []);
      setIngredients(data.pdp_config?.ingredients_table || []);
      setTrustBadges(data.pdp_config?.trust_badges || []);
      setFaqs(data.pdp_config?.faq || []);
      setProcessSteps(data.pdp_config?.process_steps || []);

      setPdpConfigRaw(JSON.stringify(data.pdp_config || EMPTY_PDP_CONFIG, null, 2));
      const cfg = data.pdp_config && typeof data.pdp_config === 'object'
        ? data.pdp_config
        : {};
      const merged = {
        ...EMPTY_PDP_CONFIG,
        ...cfg,
        taste_profile: {
          ...EMPTY_PDP_CONFIG.taste_profile,
          ...(cfg.taste_profile || {}),
        },
        tabs: { ...EMPTY_PDP_CONFIG.tabs, ...(cfg.tabs || {}) },
      };
      setPdpConfig(merged);
      setPdpConfigRaw(JSON.stringify(merged, null, 2));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Field handlers
  // ------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !isEditing && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      }),
    }));
  };

  // Generic nested-list mutators (used for variants/images/ingredients/etc).
  const updateItem = (setter) => (index, field, value) => {
    setter((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = (setter, blank) => () => setter((prev) => [...prev, blank]);

  const removeItem = (setter) => (index) => {
    setter((prev) => {
      const target = prev[index];
      if (target.id) {
        return prev.map((item, i) => (i === index ? { ...item, _deleted: true } : item));
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateVariant = updateItem(setVariants);
  const addVariant = addItem(setVariants, {
    weight_label: '', price: '', mrp: '', stock_quantity: 0, sku: '', is_active: true,
  });
  const removeVariant = removeItem(setVariants);

  const updateImage = updateItem(setImages);
  const addImage = addItem(setImages, { url: '', alt_text: '', display_order: 0 });
  const removeImage = removeItem(setImages);

  const updateIngredient = updateItem(setIngredients);
  const addIngredient = addItem(setIngredients, { ingredient: '', reason: '', percentage: '', sort_order: 0 });
  const removeIngredient = removeItem(setIngredients);

  const updateTrustBadge = updateItem(setTrustBadges);
  const addTrustBadge = addItem(setTrustBadges, {
    emoji: '', label: '', description: '', sort_order: 0, is_active: true,
  });
  const removeTrustBadge = removeItem(setTrustBadges);

  const updateFaq = updateItem(setFaqs);
  const addFaq = addItem(setFaqs, { question: '', answer: '', sort_order: 0, is_active: true });
  const removeFaq = removeItem(setFaqs);

  const updateProcessStep = updateItem(setProcessSteps);
  const addProcessStep = addItem(setProcessSteps, {
    step_number: 1, title: '', description: '', icon: '', is_active: true,
  });
  const removeProcessStep = removeItem(setProcessSteps);

  // ------------------------------------------------------------------
  // pdp_config helpers (taste_profile metrics/pairings + tabs)
  // ------------------------------------------------------------------
  const addTasteMetric = () => setPdpConfig((prev) => ({
    ...prev,
    taste_profile: {
      ...prev.taste_profile,
      metrics: [...prev.taste_profile.metrics, { label: '', value: '' }],
    },
  }));
  const updateTasteMetric = (index, field, value) => setPdpConfig((prev) => ({
    ...prev,
    taste_profile: {
      ...prev.taste_profile,
      metrics: prev.taste_profile.metrics.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    },
  }));
  const removeTasteMetric = (index) => setPdpConfig((prev) => ({
    ...prev,
    taste_profile: {
      ...prev.taste_profile,
      metrics: prev.taste_profile.metrics.filter((_, i) => i !== index),
    },
  }));

  const addTastePairing = () => setPdpConfig((prev) => ({
    ...prev,
    taste_profile: {
      ...prev.taste_profile,
      pairings: [...prev.taste_profile.pairings, { label: '', icon: '' }],
    },
  }));
  const updateTastePairing = (index, field, value) => setPdpConfig((prev) => ({
    ...prev,
    taste_profile: {
      ...prev.taste_profile,
      pairings: prev.taste_profile.pairings.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    },
  }));
  const removeTastePairing = (index) => setPdpConfig((prev) => ({
    ...prev,
    taste_profile: {
      ...prev.taste_profile,
      pairings: prev.taste_profile.pairings.filter((_, i) => i !== index),
    },
  }));

  const updateTab = (key, value) => setPdpConfig((prev) => ({
    ...prev,
    tabs: { ...prev.tabs, [key]: value },
  }));

  const onPdpRawChange = (value) => {
    setPdpConfigRaw(value);
    try {
      const parsed = JSON.parse(value);
      setPdpRawError('');
      setPdpConfig(parsed);
    } catch (e) {
      setPdpRawError(`Invalid JSON: ${e.message}`);
    }
  };

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    // Build the product payload. pdp_config is sent as the merged object.
    let finalPdpConfig;
    try {
      finalPdpConfig = pdpRawError ? pdpConfig : JSON.parse(pdpConfigRaw || '{}');
    } catch {
      finalPdpConfig = pdpConfig;
    }

    // Embed auxiliary data into pdp_config as tables don't exist
    finalPdpConfig.ingredients_table = ingredients.filter(i => !i._deleted);
    finalPdpConfig.trust_badges = trustBadges.filter(b => !b._deleted);
    finalPdpConfig.faq = faqs.filter(f => !f._deleted);
    finalPdpConfig.process_steps = processSteps.filter(s => !s._deleted);

    const productPayload = {
      name: formData.name,
      slug: formData.slug,
      short_description: formData.short_description || undefined,
      description: formData.description || undefined,
      category_id: formData.category_id || null,
      pdp_config: finalPdpConfig,
      is_active: formData.is_active,
      sort_order: Number(formData.sort_order) || 0,
    };

    try {
      let productId = id;
      if (isEditing) {
        await apiClient.put(`/products/${id}`, productPayload);
      } else {
        const res = await apiClient.post('/products', productPayload);
        productId = res?.data?.id;
      }

      // Ensure the image with the lowest display_order is marked primary (thumbnail)
      let updatedImages = [...images];
      const activeImages = updatedImages.filter(img => !img._deleted && img.url);
      if (activeImages.length > 0) {
        const sortedActive = [...activeImages].sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
        const primaryUrl = sortedActive[0].url;
        
        updatedImages = updatedImages.map((img) => ({
          ...img,
          is_primary: img.url === primaryUrl && !img._deleted,
        }));
      }

      // Persist nested sub-resources that actually have DB tables
      await Promise.all([
        ...persistVariants(productId),
        ...persistFlat(updatedImages, setImages, '/product-images', productId),
      ]);

      navigate('/products');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details?.fieldErrors) setFieldErrors(err.details.fieldErrors);
      } else {
        setError('Failed to save product.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Variants are nested under /products/:productId/variants.
  const persistVariants = (productId) =>
    variants.map((v) => {
      const payload = {
        weight_label: v.weight_label,
        price: Number(v.price) || 0,
        mrp: v.mrp === '' || v.mrp === null ? null : Number(v.mrp),
        stock_quantity: Number(v.stock_quantity) || 0,
        sku: v.sku || undefined,
        is_active: v.is_active ?? true,
      };
      if (v._deleted && v.id) return apiClient.delete(`/products/${productId}/variants/${v.id}`);
      if (v.id) return apiClient.put(`/products/${productId}/variants/${v.id}`, payload);
      if (!v.weight_label) return Promise.resolve();
      return apiClient.post(`/products/${productId}/variants`, payload);
    });

  // Flat resources (images/ingredients/trust badges/faqs/process steps)
  // live at top-level routes and are scoped by product_id in the body.
  const persistFlat = (items, setter, base, productId) =>
    items.map((item) => {
      const { id: itemId, _deleted, ...rest } = item;
      const payload = { ...rest, product_id: productId };
      if (_deleted && itemId) return apiClient.delete(`${base}/${itemId}`);
      if (itemId) return apiClient.put(`${base}/${itemId}`, payload);
      // Skip brand-new empty rows.
      if (base === '/product-images' && !payload.url) return Promise.resolve();
      if (base === '/product-ingredients' && !payload.ingredient) return Promise.resolve();
      if (base === '/trust-badges' && !payload.label) return Promise.resolve();
      if (base === '/faqs' && !payload.question) return Promise.resolve();
      if (base === '/process-steps' && !payload.title) return Promise.resolve();
      return apiClient.post(base, payload);
    });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  const visible = (arr) => arr.filter((x) => !x._deleted);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/products" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? `Editing /${formData.slug}` : 'Add a new product'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t.key
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================ BASIC ============================ */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="e.g. Mango Pickle" />
                {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name.join(', ')}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">URL Slug *</label>
                <input type="text" name="slug" required value={formData.slug} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm bg-gray-50"
                  placeholder="e.g. mango-pickle" />
                {fieldErrors.slug && <p className="text-xs text-red-600">{fieldErrors.slug.join(', ')}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm">
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {fieldErrors.category_id && <p className="text-xs text-red-600">{fieldErrors.category_id.join(', ')}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Short Description</label>
              <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                placeholder="A brief summary for the product listing..." />
              {fieldErrors.short_description && <p className="text-xs text-red-600">{fieldErrors.short_description.join(', ')}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                placeholder="Describe this product for your customers..."
              />
              {fieldErrors.description && <p className="text-xs text-red-600">{fieldErrors.description.join(', ')}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                  <span className="text-xs text-gray-400">Controls display order in lists. Lower values (e.g. 0) appear first.</span>
                </div>
                <input type="number" name="sort_order" min="0" value={formData.sort_order} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm max-w-[200px]" />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (visible on storefront)</label>
              </div>
            </div>
          </div>
        )}

        {/* ============================ VARIANTS ============================ */}
        {activeTab === 'variants' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
              <button type="button" onClick={addVariant}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </button>
            </div>
            <p className="text-xs text-gray-500">e.g. 250g / 500g / 1kg. Each variant has its own price, MRP, stock and SKU.</p>
            {visible(variants).length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No variants added yet.</p>
            ) : (
              <div className="space-y-3">
                {variants.map((v, index) => v._deleted ? null : (
                  <div key={v.id || `new-${index}`} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border border-gray-100 rounded-lg items-end">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Weight Label *</label>
                      <input type="text" value={v.weight_label} onChange={(e) => updateVariant(index, 'weight_label', e.target.value)}
                        placeholder="500g" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Price *</label>
                      <input type="number" step="0.01" min="0" value={v.price} onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">MRP</label>
                      <input type="number" step="0.01" min="0" value={v.mrp ?? ''} onChange={(e) => updateVariant(index, 'mrp', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Stock</label>
                      <input type="number" min="0" value={v.stock_quantity} onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">SKU</label>
                      <input type="text" value={v.sku ?? ''} onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" checked={v.is_active ?? true} onChange={(e) => updateVariant(index, 'is_active', e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-black focus:ring-black" />
                        Active
                      </label>
                      <button type="button" onClick={() => removeVariant(index)}
                        className="ml-auto p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================ IMAGES ============================ */}
        {activeTab === 'images' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
              <button type="button" onClick={addImage}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-1" /> Add Image
              </button>
            </div>
            <p className="text-xs text-gray-500">First image is used as the thumbnail on the product list. Set display_order to control carousel order.</p>
            {visible(images).length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No images added yet.</p>
            ) : (
              <div className="space-y-4">
                {images.map((img, index) => img._deleted ? null : (
                  <div key={img.id || `new-${index}`} className="flex flex-col md:flex-row gap-4 p-3 border border-gray-100 rounded-lg">
                    <ImageUpload
                      value={img.url}
                      onUploaded={(url) => updateImage(index, 'url', url || '')}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">Alt Text</label>
                        <input type="text" value={img.alt_text ?? ''} onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                          placeholder="Describe the image for accessibility"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600">Display Order</label>
                          <input type="number" min="0" value={img.display_order ?? 0} onChange={(e) => updateImage(index, 'display_order', e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                        </div>
                        <button type="button" onClick={() => removeImage(index)}
                          className="mt-5 p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================ INGREDIENTS ============================ */}
        {activeTab === 'ingredients' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
              <button type="button" onClick={addIngredient}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-1" /> Add Ingredient
              </button>
            </div>
            <p className="text-xs text-gray-500">List each ingredient with its description/reason, optional percentage (0–100), and sort order.</p>
            {visible(ingredients).length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No ingredients added yet.</p>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ing, index) => ing._deleted ? null : (
                  <div key={ing.id || `new-${index}`} className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 hidden md:block" />
                    <input type="text" value={ing.ingredient} onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                      placeholder="Ingredient Name (e.g. Raw Langda Mango)"
                      className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    <input type="text" value={ing.reason ?? ''} onChange={(e) => updateIngredient(index, 'reason', e.target.value)}
                      placeholder="Description / Reason (e.g. Purvanchal's pride — sharp, tangy base)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    <input type="number" min="0" max="100" value={ing.percentage ?? ''} onChange={(e) => updateIngredient(index, 'percentage', e.target.value)}
                      placeholder="%"
                      className="w-full md:w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    <input type="number" min="0" value={ing.sort_order ?? 0} onChange={(e) => updateIngredient(index, 'sort_order', e.target.value)}
                      title="Sort order"
                      className="w-full md:w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                    <button type="button" onClick={() => removeIngredient(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================ TRUST BADGES ============================ */}
        {activeTab === 'trustBadges' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Trust Badges</h2>
              <button type="button" onClick={addTrustBadge}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-1" /> Add Badge
              </button>
            </div>
            <p className="text-xs text-gray-500">e.g. 🥬 100% Natural, 🚫 No Preservatives. Pick an emoji, add a label and optional description.</p>
            {visible(trustBadges).length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No trust badges added yet.</p>
            ) : (
              <div className="space-y-3">
                {trustBadges.map((b, index) => b._deleted ? null : (
                  <div key={b.id || `new-${index}`} className="p-3 border border-gray-100 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <EmojiPicker value={b.emoji} onSelect={(emoji) => updateTrustBadge(index, 'emoji', emoji)} />
                      <input type="text" value={b.label} onChange={(e) => updateTrustBadge(index, 'label', e.target.value)}
                        placeholder="Badge label, e.g. 100% Natural"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <input type="number" min="0" value={b.sort_order ?? 0} onChange={(e) => updateTrustBadge(index, 'sort_order', e.target.value)}
                        title="Sort order"
                        className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" checked={b.is_active ?? true} onChange={(e) => updateTrustBadge(index, 'is_active', e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-black focus:ring-black" />
                        Active
                      </label>
                      <button type="button" onClick={() => removeTrustBadge(index)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea value={b.description ?? ''} onChange={(e) => updateTrustBadge(index, 'description', e.target.value)}
                      rows={2} placeholder="Optional description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================ FAQs ============================ */}
        {activeTab === 'faqs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
              <button type="button" onClick={addFaq}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </button>
            </div>
            <p className="text-xs text-gray-500">Customer questions and answers shown on the product page.</p>
            {visible(faqs).length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No FAQs added yet.</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((f, index) => f._deleted ? null : (
                  <div key={f.id || `new-${index}`} className="p-3 border border-gray-100 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="text" value={f.question} onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        placeholder="Question"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <input type="number" min="0" value={f.sort_order ?? 0} onChange={(e) => updateFaq(index, 'sort_order', e.target.value)}
                        title="Sort order"
                        className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" checked={f.is_active ?? true} onChange={(e) => updateFaq(index, 'is_active', e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-black focus:ring-black" />
                        Active
                      </label>
                      <button type="button" onClick={() => removeFaq(index)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea value={f.answer ?? ''} onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      rows={3} placeholder="Answer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================ PROCESS STEPS ============================ */}
        {activeTab === 'processSteps' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Process Steps</h2>
              <button type="button" onClick={addProcessStep}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-1" /> Add Step
              </button>
            </div>
            <p className="text-xs text-gray-500">e.g. 1. Sourcing, 2. Sun-curing, 3. Grinding. Each step has a number, title, optional description and icon.</p>
            {visible(processSteps).length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No process steps added yet.</p>
            ) : (
              <div className="space-y-3">
                {processSteps.map((s, index) => s._deleted ? null : (
                  <div key={s.id || `new-${index}`} className="p-3 border border-gray-100 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="number" min="1" value={s.step_number ?? 1} onChange={(e) => updateProcessStep(index, 'step_number', e.target.value)}
                        title="Step number"
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <input type="text" value={s.title} onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                        placeholder="Step title, e.g. Sun-Curing"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <input type="text" value={s.icon ?? ''} onChange={(e) => updateProcessStep(index, 'icon', e.target.value)}
                        placeholder="Icon (emoji or name)"
                        className="w-32 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input type="checkbox" checked={s.is_active ?? true} onChange={(e) => updateProcessStep(index, 'is_active', e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-black focus:ring-black" />
                        Active
                      </label>
                      <button type="button" onClick={() => removeProcessStep(index)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea value={s.description ?? ''} onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                      rows={2} placeholder="Optional description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================ ADDITIONAL DETAILS ============================ */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Hero & Additional Details</h2>
            <p className="text-xs text-gray-500">
              Manage extra content that appears on the frontend product page, including Taste Profile metrics and section text.
            </p>

            {/* Taste profile metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Taste Profile — Metrics</h3>
                <button type="button" onClick={addTasteMetric}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Plus className="w-4 h-4 mr-1" /> Add Metric
                </button>
              </div>
              {(pdpConfig.taste_profile?.metrics || []).map((m, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input type="text" value={m.label} onChange={(e) => updateTasteMetric(index, 'label', e.target.value)}
                    placeholder="Label, e.g. Spice Level"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                  <input type="text" value={m.value} onChange={(e) => updateTasteMetric(index, 'value', e.target.value)}
                    placeholder="Value, e.g. Medium"
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                  <button type="button" onClick={() => removeTasteMetric(index)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Taste profile pairings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Taste Profile — Pairings</h3>
                <button type="button" onClick={addTastePairing}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Plus className="w-4 h-4 mr-1" /> Add Pairing
                </button>
              </div>
              {(pdpConfig.taste_profile?.pairings || []).map((p, index) => (
                <div key={index} className="flex items-center gap-3">
                  <EmojiPicker value={p.icon} onSelect={(emoji) => updateTastePairing(index, 'icon', emoji)} />
                  <input type="text" value={p.label} onChange={(e) => updateTastePairing(index, 'label', e.target.value)}
                    placeholder="Pairing label, e.g. Steamed Rice"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                  <button type="button" onClick={() => removeTastePairing(index)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Page Sections</h3>
              <p className="text-xs text-gray-500">Plain text used for accordions/tabs on the product page.</p>
              {[
                { key: 'product_details', label: 'Product Details' },
                { key: 'shipping_support', label: 'Shipping & Support' },
                { key: 'nutrition', label: 'Nutritional Info' },
                { key: 'storage', label: 'Storage Instructions' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1 mt-2">
                  <label className="block text-xs font-medium text-gray-600">{label}</label>
                  <textarea rows={3} value={pdpConfig.tabs?.[key] ?? ''} onChange={(e) => updateTab(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black" />
                </div>
              ))}
            </div>

            {/* Raw JSON editor */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Raw JSON (advanced)</h3>
              <p className="text-xs text-gray-500">Edit the entire pdp_config blob directly. Useful for keys without dedicated UI above.</p>
              <textarea rows={12} value={pdpConfigRaw} onChange={(e) => onPdpRawChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-black focus:border-black" />
              {pdpRawError && <p className="text-xs text-red-600">{pdpRawError}</p>}
              {fieldErrors.pdp_config && <p className="text-xs text-red-600">{fieldErrors.pdp_config.join(', ')}</p>}
            </div>
          </div>
        )}

        {/* ============================ ACTIONS ============================ */}
        <div className="flex justify-end gap-4 pt-4">
          <Link to="/products"
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="inline-flex items-center px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 transition-colors">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
