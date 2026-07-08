import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ShoppingBag, MapPin, Tag, Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({});
  const [couponsUsed, setCouponsUsed] = useState([]);
  const [favouriteProducts, setFavouriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCustomerData(); }, [id]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Customer profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
      setCustomer(profile);

      // All orders for this customer
      const { data: customerOrders } = await supabase.from('orders').select('*')
        .eq('customer_id', id).order('created_at', { ascending: false });
      setOrders(customerOrders || []);

      // Calculate stats
      const paidOrders = (customerOrders || []).filter(o => o.payment_status === 'Paid' || o.status === 'Paid' || o.status === 'Delivered');
      const totalSpend = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const avgOrderValue = paidOrders.length > 0 ? totalSpend / paidOrders.length : 0;
      const cancelledOrders = (customerOrders || []).filter(o => (o.order_status || o.status) === 'Cancelled');
      const refundedOrders = (customerOrders || []).filter(o => (o.order_status || o.status) === 'Refunded');
      const firstOrder = (customerOrders || []).length > 0 ? customerOrders[customerOrders.length - 1] : null;
      const lastOrder = (customerOrders || []).length > 0 ? customerOrders[0] : null;

      setStats({
        totalOrders: (customerOrders || []).length,
        totalSpend, avgOrderValue,
        firstOrderDate: firstOrder?.created_at,
        lastOrderDate: lastOrder?.created_at,
        cancellations: cancelledOrders.length,
        refunds: refundedOrders.length,
        totalRefundAmount: refundedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
      });

      // Saved addresses
      const { data: addrs } = await supabase.from('addresses').select('*').eq('customer_id', id);
      setAddresses(addrs || []);

      // Coupons used
      const { data: couponUsage } = await supabase.from('coupon_usage').select('*, coupons(code, discount_type, discount_value)')
        .eq('customer_id', id).order('used_at', { ascending: false });
      setCouponsUsed(couponUsage || []);

      // Favourite products (most ordered)
      const orderIds = (customerOrders || []).map(o => o.id);
      if (orderIds.length > 0) {
        const { data: items } = await supabase.from('order_items').select('product_name, quantity').in('order_id', orderIds);
        const productMap = {};
        for (const item of (items || [])) {
          productMap[item.product_name] = (productMap[item.product_name] || 0) + (item.quantity || 0);
        }
        const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, quantity: qty }));
        setFavouriteProducts(sorted);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!customer) return <div className="p-8 text-center text-gray-500">Customer not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-500">{customer.email} • {customer.phone || 'No phone'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders },
          { label: 'Total Spend', value: `₹${Number(stats.totalSpend || 0).toLocaleString('en-IN')}` },
          { label: 'Avg Order Value', value: `₹${Math.round(stats.avgOrderValue || 0).toLocaleString('en-IN')}` },
          { label: 'Cancellations', value: stats.cancellations || 0 },
          { label: 'Refunds', value: stats.refunds || 0 },
          { label: 'Coupons Used', value: couponsUsed.length },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex gap-8 text-sm">
        <div><span className="text-gray-500">First Order:</span> <span className="font-medium">{stats.firstOrderDate ? format(new Date(stats.firstOrderDate), 'dd MMM yyyy') : 'N/A'}</span></div>
        <div><span className="text-gray-500">Last Order:</span> <span className="font-medium">{stats.lastOrderDate ? format(new Date(stats.lastOrderDate), 'dd MMM yyyy') : 'N/A'}</span></div>
        <div><span className="text-gray-500">Member Since:</span> <span className="font-medium">{customer.created_at ? format(new Date(customer.created_at), 'dd MMM yyyy') : 'N/A'}</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Order History ({orders.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No orders yet.</div>
              ) : orders.map(order => (
                <div key={order.id} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => navigate(`/orders/${order.id}`)}>
                  <div>
                    <p className="font-mono text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{Number(order.total).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (order.order_status || order.status) === 'Delivered' ? 'bg-green-100 text-green-800' :
                      (order.order_status || order.status) === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{order.order_status || order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Favourite Products */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Favourite Products</h2>
            </div>
            <div className="p-4 space-y-3">
              {favouriteProducts.length === 0 ? (
                <p className="text-sm text-gray-400">No data yet.</p>
              ) : favouriteProducts.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-gray-900">{p.quantity} units</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupons Used */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Coupons Used ({couponsUsed.length})</h2>
            </div>
            <div className="p-4 space-y-3">
              {couponsUsed.length === 0 ? (
                <p className="text-sm text-gray-400">No coupons used.</p>
              ) : couponsUsed.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-mono text-purple-700">{c.coupons?.code || 'Unknown'}</span>
                  <span className="text-green-600">−₹{c.discount_amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Addresses ({addresses.length})</h2>
            </div>
            <div className="p-4 space-y-4">
              {addresses.length === 0 ? (
                <p className="text-sm text-gray-400">No saved addresses.</p>
              ) : addresses.map((addr, i) => (
                <div key={i} className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{addr.full_name} {addr.is_default && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded ml-1">Default</span>}</p>
                  <p>{[addr.house_number, addr.street, addr.area].filter(Boolean).join(', ')}</p>
                  <p>{[addr.city, addr.state, addr.pin_code].filter(Boolean).join(', ')}</p>
                  <p className="text-gray-400 text-xs mt-1">{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
