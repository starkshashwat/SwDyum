// ============================================================================
// pages/ProductsList.jsx
// ----------------------------------------------------------------------------
// Product catalog list screen. Wired to the backend API:
//   GET    /api/products?search=&limit=          (list, includes nested
//                                                  product_variants/product_images)
//   PATCH  /api/products/:id                      (toggle is_active)
//   DELETE /api/products/:id                      (delete, cascades to all
//                                                  nested content entities)
//   GET    /api/categories?limit=                 (for category name lookup —
//                                                  listProducts does not join
//                                                  category name server-side)
// ============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categoriesById, setCategoriesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('id, name');
      const map = {};
      (data || []).forEach((c) => {
        map[c.id] = c.name;
      });
      setCategoriesById(map);
    } catch {
      // Non-fatal — category names just won't resolve in the table.
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*), product_images(*)')
        .order('sort_order', { ascending: true })
        .limit(100);
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the product "${name}"? This action cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Error deleting product: ${err.message || 'Unknown error'}`);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p)));
    } catch (err) {
      alert(`Error updating status: ${err.message || 'Unknown error'}`);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const priceRangeFor = (product) => {
    const prices = (product.product_variants || []).map((v) => Number(v.price)).filter((n) => !Number.isNaN(n));
    if (prices.length === 0) return '—';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory, pricing, and product details.</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">Product</th>
                <th scope="col" className="px-6 py-3 font-semibold">Category</th>
                <th scope="col" className="px-6 py-3 font-semibold">Price Range</th>
                <th scope="col" className="px-6 py-3 font-semibold text-center">Sort Order</th>
                <th scope="col" className="px-6 py-3 font-semibold text-center">Status</th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.product_images?.[0]?.url ? (
                          <img
                            src={product.product_images[0].url}
                            alt=""
                            className="w-10 h-10 rounded object-cover border border-gray-200 bg-gray-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{product.name}</span>
                          <span className="text-xs text-gray-500">/{product.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {categoriesById[product.category_id] || <span className="text-gray-400 italic">Uncategorized</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{priceRangeFor(product)}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{product.sort_order ?? 0}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(product.id, product.is_active)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${product.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
