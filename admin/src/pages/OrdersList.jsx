import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Filter, ChevronLeft, ChevronRight, Download, X, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const PAGE_SIZE = 25;

const ORDER_STATUSES = ['All', 'Pending', 'Confirmed', 'Packed', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
const PAYMENT_STATUSES = ['All', 'Paid', 'Pending', 'Refunded', 'Partially Refunded'];

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Filters
      if (orderStatusFilter !== 'All') {
        query = query.eq('order_status', orderStatusFilter);
      }
      if (paymentStatusFilter !== 'All') {
        query = query.eq('payment_status', paymentStatusFilter);
      }
      if (dateFrom) {
        query = query.gte('created_at', new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      // Search — we search across id, customer_name, customer_email, customer_phone, coupon_code
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        query = query.or(`id.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,customer_phone.ilike.%${term}%,coupon_code.ilike.%${term}%`);
      }

      // Pagination
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, orderStatusFilter, paymentStatusFilter, dateFrom, dateTo, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getOrderStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Packed': 'bg-indigo-100 text-indigo-800',
      'Ready to Ship': 'bg-cyan-100 text-cyan-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Out for Delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Returned': 'bg-pink-100 text-pink-800',
      'Refunded': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Refunded': 'bg-gray-100 text-gray-800',
      'Partially Refunded': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCustomerInfo = (order) => {
    const shipping = order.shipping_details || {};
    return {
      name: order.customer_name || shipping.name || 'Guest',
      email: order.customer_email || shipping.email || '',
      phone: order.customer_phone || shipping.phone || '',
    };
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Payment Status', 'Order Status', 'Coupon'];
    const rows = orders.map(o => {
      const c = getCustomerInfo(o);
      return [
        o.id,
        format(new Date(o.created_at), 'dd-MMM-yyyy'),
        c.name, c.email, c.phone,
        o.total, o.payment_status || 'Pending', o.order_status || 'Pending',
        o.coupon_code || ''
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setOrderStatusFilter('All');
    setPaymentStatusFilter('All');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setPage(0);
  };

  const hasActiveFilters = orderStatusFilter !== 'All' || paymentStatusFilter !== 'All' || dateFrom || dateTo || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">
            {totalCount} total order{totalCount !== 1 ? 's' : ''} • Showing page {page + 1} of {totalPages || 1}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetchOrders} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, phone, coupon..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
            hasActiveFilters ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters {hasActiveFilters && `(active)`}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Order Status</label>
            <select value={orderStatusFilter} onChange={e => { setOrderStatusFilter(e.target.value); setPage(0); }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
            <select value={paymentStatusFilter} onChange={e => { setPaymentStatusFilter(e.target.value); setPage(0); }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Coupon</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customer = getCustomerInfo(order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                      <td className="p-4 font-medium text-gray-900">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{order.id}</span>
                      </td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {format(new Date(order.created_at), 'dd MMM yyyy')}
                        <div className="text-xs text-gray-400">{format(new Date(order.created_at), 'hh:mm a')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.email}</div>
                        {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>
                          {order.payment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getOrderStatusColor(order.order_status || 'Pending')}`}>
                          {order.order_status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {order.coupon_code ? (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">{order.coupon_code}</span>
                        ) : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                          className="text-xs bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm disabled:opacity-40 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm disabled:opacity-40 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
