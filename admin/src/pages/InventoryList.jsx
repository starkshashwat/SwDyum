import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, AlertTriangle, Package, Check, X, Edit2 } from 'lucide-react';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick edit state
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editStock, setEditStock] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Fetch product variants joined with products to get names and active status
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          weight_label,
          stock_quantity,
          low_stock_threshold,
          sku,
          products:product_id(name, is_active, slug)
        `)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (variantId) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: editStock })
        .eq('id', variantId);
        
      if (error) throw error;
      
      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === variantId ? { ...item, stock_quantity: editStock } : item
      ));
      
      setEditingVariantId(null);
      
      // Log it in inventory_logs ideally
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from('inventory_logs').insert({
          variant_id: variantId,
          change_type: 'Manual Adjustment',
          quantity_changed: 0, // This logic in real life should calc difference
          note: `Quick adjusted to ${editStock}`,
          created_by: userData.user.id
        });
      }

    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock.");
    }
  };

  const filteredInventory = inventory.filter(item => {
    const productName = item.products?.name || '';
    const sku = item.sku || '';
    return productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           sku.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const lowStockItemsCount = inventory.filter(item => item.stock_quantity <= item.low_stock_threshold && item.products?.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Track and adjust stock levels across all variants.</p>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Variants</p>
            <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-red-600">{lowStockItemsCount}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="p-4">Product</th>
                <th className="p-4">Variant</th>
                <th className="p-4">SKU</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Stock Quantity</th>
                <th className="p-4">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading inventory...</td>
                </tr>
              ) : filteredInventory.map((item) => {
                const isLowStock = item.stock_quantity <= item.low_stock_threshold;
                const isOutOfStock = item.stock_quantity === 0;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">
                      {item.products?.name || 'Unknown Product'}
                      {!item.products?.is_active && <span className="ml-2 text-xs text-gray-400 font-normal">(Inactive)</span>}
                    </td>
                    <td className="p-4 text-gray-600">{item.weight_label}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{item.sku || 'N/A'}</td>
                    <td className="p-4 text-center">
                      {isOutOfStock ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">In Stock</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-lg">
                      <span className={isLowStock ? 'text-red-600' : 'text-gray-900'}>
                        {item.stock_quantity}
                      </span>
                      <span className="text-xs text-gray-400 font-normal ml-2">/ min {item.low_stock_threshold}</span>
                    </td>
                    <td className="p-4">
                      {editingVariantId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-black"
                          />
                          <button 
                            onClick={() => handleUpdateStock(item.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingVariantId(null)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setEditingVariantId(item.id);
                            setEditStock(item.stock_quantity);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Edit2 className="w-3 h-3" /> Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
