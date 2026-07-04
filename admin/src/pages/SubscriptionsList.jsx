import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, RefreshCw, XCircle, CheckCircle, PauseCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:customer_id(name, email),
          order_items:order_item_id(product_name, weight_label)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this subscription as ${newStatus}?`)) return;
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const filteredSubscriptions = subscriptions.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (s.profiles?.name && s.profiles.name.toLowerCase().includes(term)) ||
      (s.profiles?.email && s.profiles.email.toLowerCase().includes(term)) ||
      (s.order_items?.product_name && s.order_items.product_name.toLowerCase().includes(term));
      
    let matchesFilter = true;
    if (filter !== 'All') {
      matchesFilter = s.status === filter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Active</span>;
      case 'Paused': return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1 w-fit"><PauseCircle className="w-3 h-3" /> Paused</span>;
      case 'Cancelled': return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default: return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500">Manage recurring customer orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900">{subscriptions.filter(s => s.status === 'Active').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 bg-gray-50">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Plan Type</th>
                <th className="p-4">Next Delivery</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading subscriptions...</td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No subscriptions found.</td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      {sub.profiles ? (
                        <Link to={`/customers/${sub.customer_id}`} className="font-medium text-blue-600 hover:underline">
                          {sub.profiles.name}
                        </Link>
                      ) : (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-900">
                      {sub.order_items ? `${sub.order_items.product_name} (${sub.order_items.weight_label})` : 'Unknown Product'}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {sub.plan_type}
                    </td>
                    <td className="p-4 text-gray-600">
                      {sub.next_delivery_date ? new Date(sub.next_delivery_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {sub.status === 'Active' && (
                        <button 
                          onClick={() => updateStatus(sub.id, 'Paused')}
                          className="text-xs text-yellow-600 hover:underline font-medium"
                        >
                          Pause
                        </button>
                      )}
                      {sub.status === 'Paused' && (
                        <button 
                          onClick={() => updateStatus(sub.id, 'Active')}
                          className="text-xs text-green-600 hover:underline font-medium"
                        >
                          Resume
                        </button>
                      )}
                      {sub.status !== 'Cancelled' && (
                        <button 
                          onClick={() => updateStatus(sub.id, 'Cancelled')}
                          className="text-xs text-red-600 hover:underline font-medium ml-2"
                        >
                          Cancel
                        </button>
                      )}
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
