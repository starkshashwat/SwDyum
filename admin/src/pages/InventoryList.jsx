import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, AlertTriangle, Package, Check, X, Edit2, Download, TrendingUp, History, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick edit state
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editStock, setEditStock] = useState(0);

  // History modal state
  const [showHistory, setShowHistory] = useState(false);
  const [historyVariant, setHistoryVariant] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch variants and their products
      const { data: variantsData, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          weight_label,
          stock_quantity,
          low_stock_threshold,
          sku,
          price,
          product_id,
          products:product_id(name, is_active, category, slug)
        `)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      
      // 2. Fetch pending orders to calculate reserved stock
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .in('order_status', ['Pending', 'Confirmed', 'Packed', 'Ready to Ship']);
        
      const pendingOrderIds = (pendingOrders || []).map(o => o.id);
      
      let reservedMap = {};
      if (pendingOrderIds.length > 0) {
        // Unfortunately, order_items only has product_name and weight_label, not variant_id currently
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, weight_label, quantity')
          .in('order_id', pendingOrderIds);
          
        for (const item of (orderItems || [])) {
           const key = `${item.product_name}|${item.weight_label}`;
           reservedMap[key] = (reservedMap[key] || 0) + item.quantity;
        }
      }

      // 3. Process inventory data
      const enrichedInventory = (variantsData || []).map(v => {
        const key = `${v.products?.name}|${v.weight_label}`;
        const reserved = reservedMap[key] || 0;
        const available = Math.max(0, (v.stock_quantity || 0) - reserved);
        
        // Assume purchase cost is 60% of selling price for demo purposes since we don't have a cost column yet
        const cost = Math.round((v.price || 0) * 0.6);
        const margin = Math.round(((v.price || 0) - cost) / (v.price || 1) * 100);
        
        return {
          ...v,
          reserved_stock: reserved,
          available_stock: available,
          purchase_cost: cost,
          margin: margin
        };
      });

      setInventory(enrichedInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (variantId) => {
    try {
      const variant = inventory.find(i => i.id === variantId);
      const diff = editStock - variant.stock_quantity;
      
      if (diff === 0) {
        setEditingVariantId(null);
        return;
      }
      
      // The trigger update_stock_from_log handles the actual product_variants.stock_quantity update
      await supabase.from('inventory_logs').insert([{
        variant_id: variantId,
        change_type: 'Manual Adjustment',
        quantity_changed: diff,
        note: `Quick adjusted to ${editStock} by admin`,
        created_by: 'admin'
      }]);
      
      // Optimistic update locally
      setInventory(prev => prev.map(item => 
        item.id === variantId ? { 
          ...item, 
          stock_quantity: editStock,
          available_stock: Math.max(0, editStock - item.reserved_stock)
        } : item
      ));
      
      setEditingVariantId(null);
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock.");
    }
  };

  const viewHistory = async (variant) => {
    setHistoryVariant(variant);
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const { data } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('variant_id', variant.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setHistoryLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const exportCSV = () => {
    if (inventory.length === 0) return;
    const headers = ['Product', 'Variant', 'SKU', 'Category', 'Total Stock', 'Reserved', 'Available', 'Cost', 'Price', 'Margin %', 'Value'];
    const rows = filteredInventory.map(i => [
      i.products?.name, i.weight_label, i.sku || '', i.products?.category || '',
      i.stock_quantity, i.reserved_stock, i.available_stock,
      i.purchase_cost, i.price, i.margin,
      i.stock_quantity * i.price
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
  };

  const filteredInventory = inventory.filter(item => {
    const productName = item.products?.name || '';
    const sku = item.sku || '';
    const cat = item.products?.category || '';
    return productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cat.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const lowStockCount = inventory.filter(item => item.available_stock <= item.low_stock_threshold && item.products?.is_active).length;
  const outOfStockCount = inventory.filter(item => item.available_stock <= 0 && item.products?.is_active).length;
  const totalValue = inventory.reduce((sum, item) => sum + ((item.stock_quantity || 0) * (item.price || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">Track stock levels, reservations, and inventory value.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetchInventory} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Variants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inventory.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Package className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock / OOS</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{lowStockCount} / {outOfStockCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Reserved Items</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{inventory.reduce((sum, i) => sum + i.reserved_stock, 0)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center"><Package className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by product, SKU, or category..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Variant</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Total Stock</th>
                <th className="p-4 text-center">Reserved</th>
                <th className="p-4 text-center">Available</th>
                <th className="p-4 text-right">Price / Margin</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : filteredInventory.length === 0 ? (
                 <tr><td colSpan="8" className="p-8 text-center text-gray-500">No inventory matches found.</td></tr>
              ) : filteredInventory.map((item) => {
                const isOutOfStock = item.available_stock <= 0;
                const isLowStock = item.available_stock <= item.low_stock_threshold && !isOutOfStock;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.products?.name || 'Unknown'} {!item.products?.is_active && <span className="text-xs text-red-500">(Inactive)</span>}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.products?.category || 'No Category'} • SKU: <span className="font-mono">{item.sku || 'N/A'}</span></div>
                    </td>
                    <td className="p-4 text-gray-600">{item.weight_label}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOutOfStock ? 'bg-red-100 text-red-800' : isLowStock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium text-gray-900">{item.stock_quantity}</td>
                    <td className="p-4 text-center text-orange-600">{item.reserved_stock > 0 ? item.reserved_stock : '—'}</td>
                    <td className="p-4 text-center font-bold text-lg">
                      <span className={isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'}>
                        {item.available_stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium">₹{item.price}</div>
                      <div className="text-xs text-gray-500">{item.margin}% margin</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingVariantId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={editStock} onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                              className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-xs focus:ring-2 focus:ring-black" />
                            <button onClick={() => handleUpdateStock(item.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingVariantId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingVariantId(item.id); setEditStock(item.stock_quantity); }} title="Quick Adjust"
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => viewHistory(item)} title="View History"
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded">
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Inventory History</h3>
                <p className="text-sm text-gray-500">{historyVariant?.products?.name} - {historyVariant?.weight_label}</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="text-center py-8 text-gray-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading history...</div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No history found for this variant.</div>
              ) : (
                <div className="space-y-4">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        log.quantity_changed > 0 ? 'bg-green-100 text-green-700' : 
                        log.quantity_changed < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900">{log.change_type}</p>
                          <span className="text-xs text-gray-500">{format(new Date(log.created_at), 'dd MMM, hh:mm a')}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{log.note}</p>
                        <p className="text-xs text-gray-400 mt-1">By: {log.created_by || 'system'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
