import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    short_description: '',
    is_active: true,
    is_bestseller: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    base_price: '',
    mrp: '',
    cost_price: ''
  });

  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [pureIngredients, setPureIngredients] = useState([]);
  
  const [pdpConfig, setPdpConfig] = useState({
    taste_profile: { metrics: [], pairings: [] },
    tabs: { nutrition: '', storage: '', shipping: '' }
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    setLoading(true);
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      setError('Product not found');
      setLoading(false);
      return;
    }

    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      category_id: product.category_id || '',
      description: product.description || '',
      short_description: product.short_description || '',
      is_active: product.is_active ?? true,
      is_bestseller: product.is_bestseller ?? false,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      seo_keywords: product.seo_keywords || '',
      base_price: product.base_price || '',
      mrp: product.mrp || '',
      cost_price: product.cost_price || ''
    });

    if (product.pure_ingredients && Array.isArray(product.pure_ingredients)) {
      setPureIngredients(product.pure_ingredients);
    }
    
    if (product.pdp_config) {
      setPdpConfig({
        taste_profile: product.pdp_config.taste_profile || { metrics: [], pairings: [] },
        tabs: product.pdp_config.tabs || { nutrition: '', storage: '', shipping: '' }
      });
    }

    // Fetch Variants
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id);
    if (variantsData) setVariants(variantsData);

    // Fetch Images
    const { data: imagesData } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('display_order');
    if (imagesData) setImages(imagesData);

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !isEditing && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      })
    }));
  };

  // --- Variants Handlers ---
  const addVariant = () => {
    setVariants([...variants, { id: `temp-${Date.now()}`, weight_label: '', price: '', mrp: '', sku: '', stock_quantity: 0, isNew: true }]);
  };
  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // --- Images Handlers ---
  const addImage = () => {
    setImages([...images, { id: `temp-${Date.now()}`, url: '', is_primary: images.length === 0, display_order: images.length, isNew: true }]);
  };
  const updateImage = (index, field, value) => {
    const updated = [...images];
    if (field === 'is_primary' && value === true) {
      updated.forEach(img => img.is_primary = false);
    }
    updated[index][field] = value;
    setImages(updated);
  };
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // --- Pure Ingredients Handlers ---
  const addIngredient = () => {
    setPureIngredients([...pureIngredients, { id: `ing-${Date.now()}`, name: '', img: '', benefit: '' }]);
  };
  const updateIngredient = (index, field, value) => {
    const updated = [...pureIngredients];
    updated[index][field] = value;
    setPureIngredients(updated);
  };
  const removeIngredient = (index) => {
    setPureIngredients(pureIngredients.filter((_, i) => i !== index));
  };

  const uploadIngredientImage = async (index, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Maximum allowed size is 2MB.");
      return;
    }
    
    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ing_${Date.now()}.${fileExt}`;
      const filePath = `ingredients/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('review-media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('review-media').getPublicUrl(filePath);
      updateIngredient(index, 'img', data.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please ensure the review-media bucket exists.');
    } finally {
      setSaving(false);
    }
  };

  // --- PDP Config Handlers ---
  const updatePdpTab = (tabName, value) => {
    setPdpConfig(prev => ({ ...prev, tabs: { ...prev.tabs, [tabName]: value } }));
  };

  const addTasteMetric = () => {
    setPdpConfig(prev => ({
      ...prev,
      taste_profile: { ...prev.taste_profile, metrics: [...(prev.taste_profile.metrics || []), { label: '', level: 50 }] }
    }));
  };
  const updateTasteMetric = (index, field, value) => {
    setPdpConfig(prev => {
      const metrics = [...prev.taste_profile.metrics];
      metrics[index][field] = value;
      return { ...prev, taste_profile: { ...prev.taste_profile, metrics } };
    });
  };
  const removeTasteMetric = (index) => {
    setPdpConfig(prev => ({
      ...prev,
      taste_profile: { ...prev.taste_profile, metrics: prev.taste_profile.metrics.filter((_, i) => i !== index) }
    }));
  };

  const addTastePairing = () => {
    setPdpConfig(prev => ({
      ...prev,
      taste_profile: { ...prev.taste_profile, pairings: [...(prev.taste_profile.pairings || []), { name: '', icon: '🍛' }] }
    }));
  };
  const updateTastePairing = (index, field, value) => {
    setPdpConfig(prev => {
      const pairings = [...prev.taste_profile.pairings];
      pairings[index][field] = value;
      return { ...prev, taste_profile: { ...prev.taste_profile, pairings } };
    });
  };
  const removeTastePairing = (index) => {
    setPdpConfig(prev => ({
      ...prev,
      taste_profile: { ...prev.taste_profile, pairings: prev.taste_profile.pairings.filter((_, i) => i !== index) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const productPayload = {
      ...formData,
      base_price: parseFloat(formData.base_price) || 0,
      mrp: parseFloat(formData.mrp) || null,
      cost_price: parseFloat(formData.cost_price) || null,
      category_id: formData.category_id || null, // handle empty select
      pure_ingredients: pureIngredients.map(ing => ({ name: ing.name, img: ing.img, benefit: ing.benefit })),
      pdp_config: pdpConfig,
      updated_at: new Date().toISOString()
    };

    let savedProductId = id;

    // 1. Save Product
    if (isEditing) {
      const { error } = await supabase.from('products').update(productPayload).eq('id', id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('products').insert([productPayload]).select().single();
      if (error) { setError(error.message); setSaving(false); return; }
      savedProductId = data.id;
    }

    // 2. Save Variants (Replace all strategy for simplicity)
    const { error: variantDeleteError } = await supabase.from('product_variants').delete().eq('product_id', savedProductId);
    if (variantDeleteError) {
      console.error('Variant delete error:', variantDeleteError);
    }
    
    if (variants.length > 0) {
      const variantsToInsert = variants.map((v) => ({
        product_id: savedProductId,
        weight_label: v.weight_label,
        sku: v.sku || null,
        price: parseFloat(v.price) || 0,
        mrp: parseFloat(v.mrp) || null,
        stock_quantity: parseInt(v.stock_quantity) || 0,
        low_stock_threshold: 10
      }));
      const { error: variantInsertError } = await supabase.from('product_variants').insert(variantsToInsert);
      if (variantInsertError) {
        console.error('Variant insert error:', variantInsertError);
        setError('Failed to save variants: ' + variantInsertError.message);
        setSaving(false);
        return;
      }
    }

    // 3. Save Images (Replace all strategy)
    const { error: imageDeleteError } = await supabase.from('product_images').delete().eq('product_id', savedProductId);
    if (imageDeleteError) {
      console.error('Image delete error:', imageDeleteError);
    }

    if (images.length > 0) {
      const imagesToInsert = images.map((img, i) => ({
        product_id: savedProductId,
        url: img.url,
        is_primary: img.is_primary || false,
        display_order: i
      }));
      const { error: imageInsertError } = await supabase.from('product_images').insert(imagesToInsert);
      if (imageInsertError) {
        console.error('Image insert error:', imageInsertError);
        setError('Failed to save images: ' + imageInsertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate('/products');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/products" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Create Product'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? `Editing /${formData.slug}` : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea name="short_description" rows={2} value={formData.short_description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Images</h2>
              <button type="button" onClick={addImage} className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Image URL
              </button>
            </div>
            
            {images.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p>No images added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    {img.url ? (
                      <img src={img.url} className="w-12 h-12 object-cover rounded bg-white border border-gray-200" alt="Preview" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center border border-gray-300"><ImageIcon className="w-5 h-5 text-gray-400" /></div>
                    )}
                    <div className="flex-1">
                      <input type="url" placeholder="Image URL (e.g. from Supabase Storage)" value={img.url} onChange={(e) => updateImage(idx, 'url', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" required />
                    </div>
                    <label className="flex items-center text-sm text-gray-600 gap-2 cursor-pointer">
                      <input type="radio" name="primary_image" checked={img.is_primary} onChange={() => updateImage(idx, 'is_primary', true)} />
                      Primary
                    </label>
                    <button type="button" onClick={() => removeImage(idx)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Variants (Weights & Prices)</h2>
              <button type="button" onClick={addVariant} className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>No variants added. Product will use the base price.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, idx) => (
                  <div key={variant.id} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Weight Label</label>
                      <input type="text" placeholder="e.g. 250g" required value={variant.weight_label} onChange={e => updateVariant(idx, 'weight_label', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Selling Price</label>
                      <input type="number" step="0.01" required value={variant.price} onChange={e => updateVariant(idx, 'price', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">MRP</label>
                      <input type="number" step="0.01" value={variant.mrp} onChange={e => updateVariant(idx, 'mrp', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Stock Qty</label>
                      <input type="number" required value={variant.stock_quantity} onChange={e => updateVariant(idx, 'stock_quantity', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    </div>
                    <div className="flex justify-end pb-1.5">
                      <button type="button" onClick={() => removeVariant(idx)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pure Ingredients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pure Ingredients</h2>
                <p className="text-xs text-gray-500 mt-1">These will appear in the "Pure Ingredients" section on the product page.</p>
              </div>
              <button type="button" onClick={addIngredient} className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Ingredient
              </button>
            </div>

            {pureIngredients.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>No custom ingredients added. The product page will use the default ingredients.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pureIngredients.map((ing, idx) => (
                  <div key={ing.id || idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 relative">
                    <button type="button" onClick={() => removeIngredient(idx)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 bg-white rounded border border-gray-200"><Trash2 className="w-4 h-4" /></button>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ingredient Name</label>
                      <input type="text" placeholder="e.g. Raw Mango" value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      {ing.img ? (
                        <img src={ing.img} alt="Preview" className="w-16 h-16 object-cover rounded border border-gray-300 bg-white" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Upload Image (Max 2MB)</label>
                        <input type="file" accept="image/*" onChange={(e) => uploadIngredientImage(idx, e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                        <p className="text-xs text-gray-400 mt-1">Or paste a URL manually:</p>
                        <input type="url" placeholder="https://..." value={ing.img} onChange={e => updateIngredient(idx, 'img', e.target.value)} className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Benefit / Description Text</label>
                      <input type="text" placeholder="e.g. Hand-plucked tender mangoes loaded with Vitamin C..." value={ing.benefit} onChange={e => updateIngredient(idx, 'benefit', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Taste Profile Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Taste Profile & Pairings</h2>
            
            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Flavor Metrics</h3>
                <button type="button" onClick={addTasteMetric} className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                  <Plus className="w-3 h-3 mr-1" /> Add Metric
                </button>
              </div>
              
              {(!pdpConfig.taste_profile.metrics || pdpConfig.taste_profile.metrics.length === 0) && (
                <p className="text-xs text-gray-500 italic">No metrics. Will use defaults (Spicy, Tangy, etc).</p>
              )}
              
              {pdpConfig.taste_profile.metrics && pdpConfig.taste_profile.metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                  <input type="text" placeholder="e.g. Spicy" value={metric.label} onChange={e => updateTasteMetric(idx, 'label', e.target.value)} className="w-1/3 px-2 py-1 text-sm border border-gray-300 rounded" />
                  <input type="range" min="0" max="100" value={metric.level} onChange={e => updateTasteMetric(idx, 'level', parseInt(e.target.value))} className="flex-1" />
                  <span className="text-xs text-gray-500 w-8">{metric.level}%</span>
                  <button type="button" onClick={() => removeTasteMetric(idx)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Pairings */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Food Pairings</h3>
                <button type="button" onClick={addTastePairing} className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                  <Plus className="w-3 h-3 mr-1" /> Add Pairing
                </button>
              </div>
              
              {(!pdpConfig.taste_profile.pairings || pdpConfig.taste_profile.pairings.length === 0) && (
                <p className="text-xs text-gray-500 italic">No pairings. Will use defaults.</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pdpConfig.taste_profile.pairings && pdpConfig.taste_profile.pairings.map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <input type="text" placeholder="Emoji (e.g. 🍛)" value={pair.icon} onChange={e => updateTastePairing(idx, 'icon', e.target.value)} className="w-12 px-2 py-1 text-sm border border-gray-300 rounded text-center" />
                    <input type="text" placeholder="e.g. Dal Chawal" value={pair.name} onChange={e => updateTastePairing(idx, 'name', e.target.value)} className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded" />
                    <button type="button" onClick={() => removeTastePairing(idx)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Information Tabs Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Information Tabs</h2>
            <p className="text-xs text-gray-500">Leave blank to use default text for any of these tabs.</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition</label>
              <textarea rows={3} placeholder="Enter nutrition info..." value={pdpConfig.tabs.nutrition || ''} onChange={e => updatePdpTab('nutrition', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Instructions</label>
              <textarea rows={3} placeholder="Keep in a cool dry place..." value={pdpConfig.tabs.storage || ''} onChange={e => updatePdpTab('storage', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Details</label>
              <textarea rows={3} placeholder="We ship PAN-India..." value={pdpConfig.tabs.shipping || ''} onChange={e => updatePdpTab('shipping', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm" />
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Organization & Base Price */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Organization</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm">
                <option value={true}>Active</option>
                <option value={false}>Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm">
                <option value="">-- Select Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input type="checkbox" name="is_bestseller" checked={formData.is_bestseller} onChange={handleChange} className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
              <span className="text-sm font-medium text-gray-700">Mark as Bestseller</span>
            </label>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Default Price *</label>
              <input type="number" step="0.01" name="base_price" required value={formData.base_price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm" />
              <p className="text-xs text-gray-500 mt-1">Shown if variants are missing.</p>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">SEO Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
              <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg focus:ring-black sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea name="seo_description" rows={3} value={formData.seo_description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black sm:text-sm" />
            </div>
          </div>
          
        </div>
      </form>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-end gap-4 shadow-lg z-10">
        <Link to="/products" className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Discard
        </Link>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center px-8 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {isEditing ? 'Save Product' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}
