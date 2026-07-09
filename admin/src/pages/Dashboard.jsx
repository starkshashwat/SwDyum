import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, ShoppingBag, Download, DollarSign, Package, XCircle, BarChart3, Percent } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [dateRange, setDateRange] = useState('This Month');
  const [metrics, setMetrics] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (error || data?.role === 'Customer') { navigate('/login'); return; }
      setProfile(data);
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (profile) fetchDashboardData();
  }, [profile, dateRange]);

  // Realtime: refresh dashboard metrics when orders change.
  // Debounced so a burst of webhook/cron updates only triggers one refetch.
  useEffect(() => {
    if (!profile) return;
    let timer;
    const channel = supabase
      .channel('dashboard-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => fetchDashboardData(), 800);
      })
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'Today': return startOfDay(now).toISOString();
      case 'This Week': return startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      case 'This Month': return startOfMonth(now).toISOString();
      case 'This Year': return startOfYear(now).toISOString();
      default: return null; // All Time
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();

      // Fetch all orders (with optional date filter)
      let ordersQuery = supabase.from('orders').select('*');
      if (dateFilter) ordersQuery = ordersQuery.gte('created_at', dateFilter);
      const { data: orders } = await ordersQuery;
      const allOrders = orders || [];

      // Calculate metrics
      const paidOrders = allOrders.filter(o => o.payment_status === 'Paid' || o.status === 'Paid' || o.status === 'Delivered');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
      const pendingOrders = allOrders.filter(o => (o.order_status || o.status) === 'Pending').length;
      const deliveredOrders = allOrders.filter(o => (o.order_status || o.status) === 'Delivered').length;
      const cancelledOrders = allOrders.filter(o => (o.order_status || o.status) === 'Cancelled').length;
      const refundedOrders = allOrders.filter(o => (o.order_status || o.status) === 'Refunded');
      const totalRefunds = refundedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      // Products sold count
      let itemsQuery = supabase.from('order_items').select('quantity, order_id');
      const { data: allItems } = await itemsQuery;
      const paidOrderIds = new Set(paidOrders.map(o => o.id));
      const paidItems = (allItems || []).filter(i => paidOrderIds.has(i.order_id));
      const productsSold = paidItems.reduce((sum, i) => sum + (i.quantity || 0), 0);

      // Coupon usage count
      const ordersWithCoupon = allOrders.filter(o => o.coupon_code).length;

      // Customer counts
      let customersQuery = supabase.from('profiles').select('id, created_at').eq('role', 'Customer');
      const { data: customers } = await customersQuery;
      const totalCustomers = (customers || []).length;
      const newCustomers = dateFilter ? (customers || []).filter(c => c.created_at >= dateFilter).length : totalCustomers;

      // Inventory value
      const { data: variants } = await supabase.from('product_variants').select('stock_quantity, price');
      const inventoryValue = (variants || []).reduce((sum, v) => sum + (v.stock_quantity || 0) * Number(v.price || 0), 0);

      setMetrics({
        totalRevenue, totalOrders: allOrders.length, avgOrderValue,
        pendingOrders, deliveredOrders, cancelledOrders, totalRefunds,
        productsSold, inventoryValue, newCustomers, totalCustomers, couponUsage: ordersWithCoupon
      });

      // Top selling products
      const productCounts = {};
      for (const item of paidItems) {
        // Need product name — fetch from order_items with name
        // We'll re-query with product_name
      }
      const { data: itemsWithNames } = await supabase.from('order_items').select('product_name, quantity, total_price, order_id');
      const paidItemsNamed = (itemsWithNames || []).filter(i => paidOrderIds.has(i.order_id));
      const productMap = {};
      for (const item of paidItemsNamed) {
        if (!productMap[item.product_name]) productMap[item.product_name] = { name: item.product_name, sales: 0, revenue: 0 };
        productMap[item.product_name].sales += item.quantity || 0;
        productMap[item.product_name].revenue += Number(item.total_price || 0);
      }
      const sorted = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      setTopProducts(sorted);

      // Revenue over time (last 7 or 30 days)
      const days = dateRange === 'Today' ? 1 : dateRange === 'This Week' ? 7 : dateRange === 'This Month' ? 30 : 12;
      const revenueByDay = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, dateRange === 'This Year' || dateRange === 'All Time' ? 'MMM' : 'dd MMM');
        revenueByDay[key] = 0;
      }
      for (const o of paidOrders) {
        const key = format(new Date(o.created_at), dateRange === 'This Year' || dateRange === 'All Time' ? 'MMM' : 'dd MMM');
        if (revenueByDay[key] !== undefined) revenueByDay[key] += Number(o.total || 0);
      }
      setRevenueData(Object.entries(revenueByDay).map(([name, revenue]) => ({ name, revenue })));

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const m = metrics;
  const COLORS = ['#000', '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.name}</h1>
          <p className="text-sm text-gray-500">Track revenue, monitor growth, and understand customer behavior.</p>
        </div>
        <div className="flex gap-2">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black font-medium text-sm">
            <option>Today</option><option>This Week</option><option>This Month</option><option>This Year</option><option>All Time</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading metrics...</div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${Number(m.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'green' },
              { label: 'Total Orders', value: m.totalOrders || 0, icon: ShoppingBag, color: 'blue' },
              { label: 'Avg Order Value', value: `₹${Math.round(m.avgOrderValue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'purple' },
              { label: 'Products Sold', value: m.productsSold || 0, icon: Package, color: 'indigo' },
              { label: 'Pending Orders', value: m.pendingOrders || 0, icon: ShoppingBag, color: 'yellow' },
              { label: 'Delivered Orders', value: m.deliveredOrders || 0, icon: Package, color: 'green' },
              { label: 'Cancelled Orders', value: m.cancelledOrders || 0, icon: XCircle, color: 'red' },
              { label: 'Refunds', value: `₹${Number(m.totalRefunds || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'gray' },
              { label: 'Inventory Value', value: `₹${Number(m.inventoryValue || 0).toLocaleString('en-IN')}`, icon: BarChart3, color: 'teal' },
              { label: 'New Customers', value: m.newCustomers || 0, icon: Users, color: 'orange' },
              { label: 'Total Customers', value: m.totalCustomers || 0, icon: Users, color: 'blue' },
              { label: 'Coupon Usage', value: m.couponUsage || 0, icon: Percent, color: 'purple' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-${card.color}-50 flex items-center justify-center text-${card.color}-600`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Over Time</h3>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-64 flex items-center justify-center text-gray-400">No revenue data</div>}
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No product data yet</div>
                ) : topProducts.map((product, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">#{i + 1}</div>
                      <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{Number(product.revenue).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500">{product.sales} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Note about COD */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
            <strong>Note:</strong> Swadyum currently accepts online payments only (Razorpay). COD is not available.
          </div>
        </>
      )}
    </div>
  );
}
