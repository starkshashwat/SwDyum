import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';

export default function CategoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    banner_url: '',
    seo_title: '',
    seo_description: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Category not found');
    } else {
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        banner_url: data.banner_url || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || ''
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if typing name and not editing an existing strict slug
      ...(name === 'name' && !isEditing && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      banner_url: formData.banner_url,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      updated_at: new Date().toISOString()
    };

    let saveError = null;

    if (isEditing) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id);
      saveError = error;
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([payload]);
      saveError = error;
    }

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
    } else {
      navigate('/categories');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading category...</div>;
  }

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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="banner_url"
                  value={formData.banner_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.banner_url && (
                <img 
                  src={formData.banner_url} 
                  alt="Banner preview" 
                  className="h-10 w-16 object-cover rounded border border-gray-200"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
            <p className="text-xs text-gray-500">Provide a direct link to an image (e.g. from Supabase Storage).</p>
          </div>
        </div>

        {/* SEO Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Search Engine Optimization (SEO)</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SEO Title</label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
              placeholder="e.g. Best Authentic Mango Pickles Online | Swadyum"
            />
            <p className="text-xs text-gray-500">Leave blank to use the Category Name automatically.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SEO Meta Description</label>
            <textarea
              name="seo_description"
              rows={2}
              value={formData.seo_description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
              placeholder="A short snippet to appear in Google search results (150-160 characters)"
            />
          </div>
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
