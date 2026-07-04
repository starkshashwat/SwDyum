import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, ExternalLink, Download } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Fetch order + profile
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`*, profiles:customer_id(*)`)
        .eq('id', id)
        .single();
        
      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
        
      if (itemsError) throw itemsError;
      setItems(itemsData || []);
      
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      setOrder(prev => ({ ...prev, status: newStatus }));
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  const shipping = typeof order.shipping_details === 'string' ? JSON.parse(order.shipping_details) : order.shipping_details;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Status update dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select 
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none disabled:opacity-50"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="RTO">RTO</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items and Shiprocket */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <Package className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            </div>
            <div className="p-6">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Variant: {item.weight_label}</p>
                      <p className="text-sm text-gray-500">Sub: {item.subscription_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.total_price}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} x ₹{item.unit_price}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping Fee</span>
                  <span>₹{order.shipping_fee}</span>
                </div>
                {order.cod_fee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>COD Fee</span>
                    <span>₹{order.cod_fee}</span>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shiprocket Panel Mockup */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-indigo-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-medium text-indigo-900">Shiprocket Fulfillment</h2>
              </div>
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">Integration</span>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Use these controls to push the order to your Shiprocket account and generate shipping manifests.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                  <ExternalLink className="w-4 h-4" /> Push to Shiprocket
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm" disabled>
                  <Download className="w-4 h-4" /> Download Label (AWB)
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm" disabled>
                  Request Pickup
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                <strong>Note:</strong> API keys are currently disabled in the development environment. 
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Customer Details */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <User className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Customer</h2>
            </div>
            <div className="p-6">
              <p className="font-medium text-gray-900">{order.profiles?.name || 'Guest'}</p>
              <p className="text-sm text-gray-600 mt-1">{order.profiles?.email || 'N/A'}</p>
              <p className="text-sm text-gray-600 mt-1">{order.profiles?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
            </div>
            <div className="p-6 text-sm text-gray-600 space-y-1">
              {shipping ? (
                <>
                  <p className="font-medium text-gray-900">{shipping.fullName}</p>
                  <p>{shipping.addressLine1}</p>
                  {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                  <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                  <p className="pt-2">Phone: {shipping.phone}</p>
                </>
              ) : (
                <p>No shipping details provided.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
            </div>
            <div className="p-6 text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium text-gray-900">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <span className="font-medium text-gray-900">{order.payment_id || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
