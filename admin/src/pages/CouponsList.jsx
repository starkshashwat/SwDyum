import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Tag, Plus, Edit2, Trash2, Check, X, Calendar, TrendingDown, Users, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

export default function CouponsList() {
  const [coupons, setCoupons] = useState([]);
  const [couponStats, setCouponStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    expiry_date: ''
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Usage modal state
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageData, setUsageData] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const couponsList = data || [];
      
      // Fetch stats for all coupons
      const { data: usage } = await supabase
        .from('coupon_usage')
        .select('coupon_id, discount_amount, customer_id, order_id');
        
      const statsMap = {};
      for (const u of (usage || [])) {
        if (!statsMap[u.coupon_id]) statsMap[u.coupon_id] = { totalDiscount: 0, users: new Set(), orders: 0 };
        statsMap[u.coupon_id].totalDiscount += Number(u.discount_amount || 0);
        statsMap[u.coupon_id].users.add(u.customer_id);
        statsMap[u.coupon_id].orders += 1;
      }
      
      setCouponStats(statsMap);
      setCoupons(couponsList);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleEditClick = (coupon) => {
    setEditingCoupon({
      ...coupon,
      expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        discount_type: editingCoupon.discount_type,
        discount_value: Number(editingCoupon.discount_value),
        expiry_date: editingCoupon.expiry_date ? new Date(editingCoupon.expiry_date).toISOString() : null,
      };

      const { error } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', editingCoupon.id);

      if (error) throw error;
      
      setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...payload } : c));
      setShowEditModal(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error('Error updating coupon:', err);
      alert('Failed to update coupon: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        code: newCoupon.code.toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: Number(newCoupon.discount_value),
        expiry_date: newCoupon.expiry_date ? new Date(newCoupon.expiry_date).toISOString() : null,
        is_active: true,
        times_used: 0
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert([payload])
        .select();

      if (error) throw error;
      
      setCoupons([data[0], ...coupons]);
      setShowCreateModal(false);
      setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '', expiry_date: '' });
    } catch (err) {
      console.error('Error creating coupon:', err);
      alert('Failed to create coupon: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const viewUsage = async (couponId) => {
    setShowUsageModal(true);
    setUsageLoading(true);
    try {
      const { data } = await supabase
        .from('coupon_usage')
        .select(`
          id, discount_amount, used_at, order_id,
          profiles(name, email)
        `)
        .eq('coupon_id', couponId)
        .order('used_at', { ascending: false });
        
      setUsageData(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsageLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">Manage promotional codes and view usage analytics.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4 text-center">Uses</th>
                <th className="p-4 text-center">Analytics</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading coupons...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No coupons found.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const stats = couponStats[coupon.id] || { totalDiscount: 0, users: new Set(), orders: 0 };
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-purple-500" />
                          <span className="font-bold text-purple-700 font-mono text-base">{coupon.code}</span>
                        </div>
                        {coupon.expiry_date && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> 
                            Expires {format(new Date(coupon.expiry_date), 'dd MMM yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-gray-900">{coupon.times_used || 0}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-4 text-xs">
                          <div className="text-center" title="Total Discount Given">
                            <div className="flex items-center justify-center gap-1 text-green-600 mb-0.5"><TrendingDown className="w-3 h-3" /> ₹{stats.totalDiscount}</div>
                            <span className="text-gray-400">Discounted</span>
                          </div>
                          <div className="text-center" title="Unique Users">
                            <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5"><Users className="w-3 h-3" /> {stats.users.size}</div>
                            <span className="text-gray-400">Users</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => viewUsage(coupon.id)}
                            className="p-1.5 rounded-md transition-colors text-gray-500 hover:text-black hover:bg-gray-100"
                            title="View Usage History"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditClick(coupon)}
                            className="p-1.5 rounded-md transition-colors text-gray-500 hover:text-black hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                            className={`p-1.5 rounded-md transition-colors ${
                              coupon.is_active ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={coupon.is_active ? "Disable" : "Enable"}
                          >
                            {coupon.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Coupon Usage History</h3>
              <button onClick={() => setShowUsageModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {usageLoading ? (
                <div className="text-center py-12 text-gray-500">Loading usage history...</div>
              ) : usageData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">This coupon has not been used yet.</div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="p-4 font-medium text-gray-500 uppercase text-xs">Date</th>
                      <th className="p-4 font-medium text-gray-500 uppercase text-xs">Order ID</th>
                      <th className="p-4 font-medium text-gray-500 uppercase text-xs">Customer</th>
                      <th className="p-4 font-medium text-gray-500 uppercase text-xs text-right">Discount Given</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usageData.map((usage) => (
                      <tr key={usage.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500">{format(new Date(usage.used_at), 'dd MMM yyyy, hh:mm a')}</td>
                        <td className="p-4 font-mono text-xs text-gray-900">{usage.order_id}</td>
                        <td className="p-4">
                          {usage.profiles ? (
                            <>
                              <div className="font-medium text-gray-900">{usage.profiles.name}</div>
                              <div className="text-xs text-gray-500">{usage.profiles.email}</div>
                            </>
                          ) : (
                            <span className="text-gray-500 italic">Guest</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-medium text-green-600">−₹{usage.discount_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input 
                  type="text" 
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black uppercase"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select 
                    value={newCoupon.discount_type}
                    onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newCoupon.discount_value}
                    onChange={e => setNewCoupon({...newCoupon, discount_value: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    value={newCoupon.expiry_date}
                    onChange={e => setNewCoupon({...newCoupon, expiry_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:text-black font-medium text-sm">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-medium text-sm">
                  {isCreating ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && editingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Coupon</h2>
            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input type="text" value={editingCoupon.code} disabled className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-sm" />
                <p className="text-xs text-gray-500 mt-1">Code cannot be changed.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select value={editingCoupon.discount_type} onChange={e => setEditingCoupon({...editingCoupon, discount_type: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input type="number" required min="1" value={editingCoupon.discount_value} onChange={e => setEditingCoupon({...editingCoupon, discount_value: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input type="date" value={editingCoupon.expiry_date} onChange={e => setEditingCoupon({...editingCoupon, expiry_date: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:text-black font-medium text-sm">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-medium text-sm">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
