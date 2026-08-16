import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, AlertTriangle, Package, Check, X, Edit2, Download, TrendingUp, History, RefreshCw, Filter, Plus } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { Link } from 'react-router-dom';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Advanced edit state
  const [editingVariant, setEditingVariant] = useState(null);
  const [editForm, setEditForm] = useState({
    stock_quantity: 0,
    cost_price: 0,
    low_stock_threshold: 10,
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);

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
      
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          is_active,
          slug,
          categories (
            name
          ),
          product_variants (
            id,
            weight_label,
            stock_quantity,
            reserved_quantity,
            low_stock_threshold,
            cost_price,
            batch_number,
            manufacturing_date,
            expiry_date,
            sku,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let enrichedInventory = [];

      (productsData || []).forEach(product => {
        const variants = product.product_variants || [];
        
        if (variants.length === 0) {
          enrichedInventory.push({
            id: `placeholder-${product.id}`,
            is_placeholder: true,
            product_id: product.id,
            products: {
              name: product.name,
              is_active: product.is_active,
              category: product.categories?.name,
              slug: product.slug
            },
            available_stock: 0,
            stock_quantity: 0,
            reserved_quantity: 0,
            cost_price: 0,
            price: 0,
            margin: 0
          });
        } else {
          variants.forEach(v => {
            const available = Math.max(0, (v.stock_quantity || 0) - (v.reserved_quantity || 0));
            const cost = v.cost_price || 0;
            let margin = 0;
            if (v.price && v.price > 0 && cost > 0) {
              margin = Math.round(((v.price - cost) / v.price) * 100);
            }
            
            enrichedInventory.push({
              ...v,
              product_id: product.id,
              products: {
                name: product.name,
                is_active: product.is_active,
                category: product.categories?.name,
                slug: product.slug
              },
              available_stock: available,
              margin: margin
            });
          });
        }
      });
      
      enrichedInventory.sort((a, b) => a.available_stock - b.available_stock);

      setInventory(enrichedInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingVariant(item);
    setEditForm({
      stock_quantity: item.stock_quantity || 0,
      cost_price: item.cost_price || 0,
      low_stock_threshold: item.low_stock_threshold || 10,
      batch_number: item.batch_number || '',
      manufacturing_date: item.manufacturing_date || '',
      expiry_date: item.expiry_date || '',
      reason: ''
    });
  };

  const handleUpdateStock = async () => {
    if (!editingVariant) return;

    const newQty = parseInt(editForm.stock_quantity);
    if (Number.isNaN(newQty) || newQty < 0) {
      alert("Stock quantity must be zero or a positive number.");
      return;
    }
    if (editForm.manufacturing_date && editForm.expiry_date
        && new Date(editForm.expiry_date) <= new Date(editForm.manufacturing_date)) {
      alert("Expiry date must be after the manufacturing date.");
      return;
    }

    setSaving(true);
    try {
      // Re-read the variant's CURRENT stock right before saving. The diff
      // must be computed against fresh data — a sale or another admin's
      // adjustment since page load would otherwise be silently reverted.
      const { data: freshVariant, error: freshError } = await supabase
        .from('product_variants')
        .select('id, stock_quantity')
        .eq('id', editingVariant.id)
        .single();
      if (freshError) throw freshError;

      const diff = newQty - freshVariant.stock_quantity;
      // A reason is required for any stock change
      if (diff !== 0 && !editForm.reason.trim()) {
        alert("Please provide a reason for the stock adjustment.");
        setSaving(false);
        return;
      }
      // If someone else changed stock while the form was open, warn instead
      // of overwriting their change blindly.
      if (freshVariant.stock_quantity !== editingVariant.stock_quantity) {
        const proceed = window.confirm(
          `Stock changed while you were editing (was ${editingVariant.stock_quantity}, now ${freshVariant.stock_quantity}).
` +
          `Saving will set it to ${newQty}. Continue?`
        );
        if (!proceed) { setSaving(false); return; }
      }

      // Update non-stock fields
      const { error: variantError } = await supabase
        .from('product_variants')
        .update({
          cost_price: parseFloat(editForm.cost_price) || 0,
          low_stock_threshold: parseInt(editForm.low_stock_threshold) || 0,
          batch_number: editForm.batch_number || null,
          manufacturing_date: editForm.manufacturing_date || null,
          expiry_date: editForm.expiry_date || null
        })
        .eq('id', editingVariant.id);
        
      if (variantError) throw variantError;

      // Insert log for stock adjustment (if changed) — the DB trigger
      // applies quantity_changed to stock_quantity.
      if (diff !== 0) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error: logError } = await supabase.from('inventory_logs').insert([{
          variant_id: editingVariant.id,
          change_type: 'Manual Adjustment',
          quantity_changed: diff,
          reserved_changed: 0,
          note: editForm.reason,
          created_by: user?.email || 'admin'
        }]);

        if (logError) throw logError;
      }
      
      // Refresh to get exact state
      await fetchInventory();
      setEditingVariant(null);
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock: " + error.message);
    } finally {
      setSaving(false);
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
    const headers = [
      'Product', 'Variant', 'SKU', 'Category', 
      'Total Stock', 'Reserved', 'Available', 
      'Cost', 'Price', 'Margin %', 'Value',
      'Batch', 'Mfg Date', 'Exp Date'
    ];
    const rows = filteredInventory.map(i => [
      i.products?.name, i.is_placeholder ? 'Stock not set' : i.weight_label, i.sku || '', i.products?.category || '',
      i.stock_quantity, i.reserved_quantity, i.available_stock,
      i.cost_price || 0, i.price || 0, i.margin || 0,
      (i.stock_quantity || 0) * (i.price || 0),
      i.batch_number || '', i.manufacturing_date || '', i.expiry_date || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
  };

  const filteredInventory = inventory.filter(item => {
    const productName = item.products?.name || '';
    const sku = item.sku || '';
    const cat = item.products?.category || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cat.toLowerCase().includes(searchTerm.toLowerCase());
                          
    let matchesStatus = true;
    if (filterStatus === 'Low Stock') {
      matchesStatus = item.available_stock > 0 && item.available_stock <= item.low_stock_threshold;
    } else if (filterStatus === 'Out of Stock') {
      matchesStatus = item.available_stock <= 0;
    } else if (filterStatus === 'In Stock') {
      matchesStatus = item.available_stock > item.low_stock_threshold;
    }
    
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter(item => !item.is_placeholder && item.available_stock > 0 && item.available_stock <= item.low_stock_threshold && item.products?.is_active).length;
  const outOfStockCount = inventory.filter(item => !item.is_placeholder && item.available_stock <= 0 && item.products?.is_active).length;
  const totalReserved = inventory.reduce((sum, item) => sum + (item.reserved_quantity || 0), 0);
  const totalValue = inventory.reduce((sum, item) => sum + ((item.stock_quantity || 0) * (item.price || 0)), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Track stock levels, reservations, batches, and inventory value.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="group bg-white border border-gray-200/80 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-2 text-sm font-semibold transition-all hover:-translate-y-0.5">
            <Download className="w-4 h-4 group-hover:text-blue-600 transition-colors" /> Export CSV
          </button>
          <button onClick={fetchInventory} className="bg-white border border-gray-200/80 text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-gray-300 transition-all hover:-translate-y-0.5">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Total Variants</p>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner border border-blue-100/50"><Package className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-4 tracking-tight relative z-10">{inventory.length}</p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Low / Out of Stock</p>
            <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100/50 text-red-600 rounded-xl flex items-center justify-center shadow-inner border border-red-100/50"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold mt-4 tracking-tight relative z-10">
            <span className="text-amber-500">{lowStockCount}</span>
            <span className="text-gray-300 mx-2 font-light">/</span>
            <span className="text-red-500">{outOfStockCount}</span>
          </p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Reserved Items</p>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-600 rounded-xl flex items-center justify-center shadow-inner border border-orange-100/50"><Package className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-orange-500 mt-4 tracking-tight relative z-10">{totalReserved}</p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Total Value</p>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner border border-emerald-100/50"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-4 tracking-tight relative z-10">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center bg-white/40 backdrop-blur-md">
          <div className="relative w-full sm:w-96 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search product or SKU..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-gray-50/50 focus:bg-white transition-all shadow-inner" />
          </div>
          <div className="relative w-full sm:w-48 group">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none bg-gray-50/50 focus:bg-white transition-all font-medium cursor-pointer shadow-inner"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <th className="p-5 w-64">Product & Variant</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-center">Total Stock</th>
                <th className="p-5 text-center">Reserved</th>
                <th className="p-5 text-center">Available</th>
                <th className="p-5 text-center">Batch / Exp</th>
                <th className="p-5 text-right">Price / Margin</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="8" className="p-16 text-center text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />Loading inventory data...</td></tr>
              ) : filteredInventory.length === 0 ? (
                 <tr><td colSpan="8" className="p-16 text-center text-gray-500 font-medium">No inventory matches your filters.</td></tr>
              ) : filteredInventory.map((item) => {
                if (item.is_placeholder) {
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-5">
                        <div className="font-bold text-gray-900 text-[15px]">{item.products?.name || 'Unknown'} {!item.products?.is_active && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded ml-2 align-middle border border-red-100">Inactive</span>}</div>
                        <div className="text-[13px] text-gray-500 mt-1.5 flex items-center gap-2">
                          <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">Stock not set</span>
                        </div>
                      </td>
                      <td className="p-5 text-center" colSpan="6">
                        <span className="text-gray-400 italic text-sm">Please add a variant to this product to manage stock.</span>
                      </td>
                      <td className="p-5 text-right">
                         <Link to={`/products/${item.product_id}`} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow">
                            <Plus className="w-3.5 h-3.5" /> Add Stock
                         </Link>
                      </td>
                    </tr>
                  );
                }

                const isOutOfStock = item.available_stock <= 0;
                const isLowStock = item.available_stock <= item.low_stock_threshold && !isOutOfStock;
                
                // Expiry risk calculation (if expiry within 30 days)
                let isExpiryRisk = false;
                if (item.expiry_date) {
                  const daysToExpiry = (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
                  isExpiryRisk = daysToExpiry > 0 && daysToExpiry <= 30;
                }
                
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-gray-900 text-[15px]">{item.products?.name || 'Unknown'} {!item.products?.is_active && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded ml-2 align-middle border border-red-100">Inactive</span>}</div>
                      <div className="text-[13px] text-gray-500 mt-1.5 flex items-center gap-2">
                        <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">{item.weight_label}</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-mono text-gray-500 tracking-tight">{item.sku || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' : isLowStock ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {isOutOfStock && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>}
                        {isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
                        {!isOutOfStock && !isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-5 text-center font-medium text-gray-600">{item.stock_quantity}</td>
                    <td className="p-5 text-center">
                      {item.reserved_quantity > 0 ? (
                        <span className="text-orange-600 font-bold text-xs px-2 py-1 bg-orange-50 rounded-md border border-orange-100 shadow-sm">{item.reserved_quantity}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="p-5 text-center font-extrabold text-[17px]">
                      <span className={isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-gray-900'}>
                        {item.available_stock}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      {item.batch_number ? (
                        <div className="text-[11px] font-mono font-semibold tracking-wider text-gray-700 bg-gray-100 border border-gray-200 inline-block px-2 py-0.5 rounded-md shadow-sm">{item.batch_number}</div>
                      ) : <span className="text-gray-300">—</span>}
                      {item.expiry_date && (
                        <div className={`text-[11px] font-semibold mt-1.5 ${isExpiryRisk ? 'text-red-600 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 inline-flex items-center justify-center gap-1 shadow-sm' : 'text-gray-500'}`}>
                          {isExpiryRisk && <AlertTriangle className="w-3 h-3" />}
                          Exp: {format(new Date(item.expiry_date), 'dd/MM/yy')}
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="font-bold text-gray-900">₹{item.price?.toLocaleString('en-IN') || 0}</div>
                      <div className="text-[11px] font-medium text-gray-500 mt-1">Cost: ₹{item.cost_price || 0} <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 ml-1">({item.margin}%)</span></div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(item)} title="Edit Stock & Details"
                          className="p-2 text-blue-600 hover:bg-blue-50 hover:shadow-sm border border-transparent hover:border-blue-100 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => viewHistory(item)} title="View Logs"
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all">
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

      {/* Editing Modal */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Adjust Inventory</h3>
                <p className="text-sm text-gray-500">{editingVariant.products?.name} - {editingVariant.weight_label}</p>
              </div>
              <button onClick={() => setEditingVariant(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Stock</label>
                  <input type="number" 
                    value={editForm.stock_quantity} 
                    onChange={e => setEditForm({...editForm, stock_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available: {Math.max(0, parseInt(editForm.stock_quantity || 0) - editingVariant.reserved_quantity)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Low Stock Threshold</label>
                  <input type="number" 
                    value={editForm.low_stock_threshold} 
                    onChange={e => setEditForm({...editForm, low_stock_threshold: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              {parseInt(editForm.stock_quantity) !== editingVariant.stock_quantity && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Change <span className="text-red-500">*</span></label>
                  <input type="text" 
                    placeholder="e.g. Restock, damaged goods, count correction"
                    value={editForm.reason} 
                    onChange={e => setEditForm({...editForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              )}

              <div className="border-t border-gray-200 my-2 pt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Product Cost & Tracking</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cost Price (₹)</label>
                    <input type="number" step="0.01"
                      value={editForm.cost_price} 
                      onChange={e => setEditForm({...editForm, cost_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number</label>
                    <input type="text" 
                      value={editForm.batch_number} 
                      onChange={e => setEditForm({...editForm, batch_number: e.target.value})}
                      placeholder="e.g. BATCH-2023-01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mfg Date</label>
                      <input type="date" 
                        value={editForm.manufacturing_date} 
                        onChange={e => setEditForm({...editForm, manufacturing_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                      <input type="date" 
                        value={editForm.expiry_date} 
                        onChange={e => setEditForm({...editForm, expiry_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingVariant(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStock} 
                disabled={saving || (parseInt(editForm.stock_quantity) !== editingVariant.stock_quantity && !editForm.reason.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-lg h-full flex flex-col animate-slide-in-right">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Inventory Logs</h3>
                <p className="text-sm text-gray-500">{historyVariant?.products?.name} - {historyVariant?.weight_label}</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50">
              {historyLoading ? (
                <div className="text-center py-12 text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />Fetching logs...</div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">No activity logged for this variant.</div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline dot */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-50 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                         log.quantity_changed > 0 ? 'text-green-500' : 
                         log.quantity_changed < 0 ? 'text-red-500' : 
                         log.reserved_changed > 0 ? 'text-orange-500' : 'text-gray-400'
                      }`}>
                         {log.quantity_changed > 0 ? <TrendingUp className="w-4 h-4" /> : 
                          log.quantity_changed < 0 ? <TrendingUp className="w-4 h-4 transform rotate-180" /> : 
                          log.reserved_changed > 0 ? <Package className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-gray-900">{log.change_type}</span>
                          <span className="text-xs text-gray-500">{format(new Date(log.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        
                        <div className="flex gap-4 mt-2 mb-2">
                          {log.quantity_changed !== 0 && (
                             <div className="text-xs">
                               <span className="text-gray-500 block">Total Stock</span>
                               <span className={`font-bold ${log.quantity_changed > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                 {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed}
                               </span>
                             </div>
                          )}
                          {log.reserved_changed !== 0 && (
                             <div className="text-xs">
                               <span className="text-gray-500 block">Reserved</span>
                               <span className={`font-bold ${log.reserved_changed > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                 {log.reserved_changed > 0 ? '+' : ''}{log.reserved_changed}
                               </span>
                             </div>
                          )}
                        </div>
                        
                        {log.note && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">{log.note}</p>}
                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider text-right">By {log.created_by}</p>
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
