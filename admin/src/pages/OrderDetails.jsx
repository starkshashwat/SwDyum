import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CreditCard, MapPin, Clock, Truck, Tag, FileText, ChevronDown, Save } from 'lucide-react';
import { format } from 'date-fns';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders').select('*').eq('id', id).single();
      if (orderError) throw orderError;
      setOrder(orderData);
      setNewStatus(orderData.order_status || orderData.status || 'Pending');

      // Fetch order items
      const { data: itemsData } = await supabase
        .from('order_items').select('*').eq('order_id', id);
      setItems(itemsData || []);

      // Fetch timeline
      const { data: timelineData } = await supabase
        .from('order_timeline').select('*').eq('order_id', id).order('created_at', { ascending: true });
      setTimeline(timelineData || []);

      // Fetch payment
      const { data: paymentData } = await supabase
        .from('payments').select('*').eq('order_id', id).order('created_at', { ascending: false }).limit(1).single();
      setPayment(paymentData);

      // Fetch invoice
      const { data: invoiceData } = await supabase
        .from('invoices').select('*').eq('order_id', id).single();
      setInvoice(invoiceData);

      // Fetch shipment for tracking
      const { data: shipmentData } = await supabase
        .from('shipments').select('*').eq('order_id', id).single();
      if (shipmentData) {
        setTrackingNumber(shipmentData.awb_code || '');
        setCourierName(shipmentData.courier_name || '');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === (order.order_status || order.status)) return;
    setSaving(true);
    try {
      await supabase.from('orders').update({
        order_status: newStatus,
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', id);

      await supabase.from('order_timeline').insert([{
        order_id: id,
        event: newStatus,
        note: `Status changed to ${newStatus} by admin`,
        created_by: 'admin'
      }]);

      // If cancelled and status was before shipping, restore inventory
      if (newStatus === 'Cancelled' && ['Pending', 'Confirmed', 'Packed', 'Ready to Ship'].includes(order.order_status || order.status)) {
        for (const item of items) {
          if (item.variant_id) {
            await supabase.from('inventory_logs').insert([{
              variant_id: item.variant_id,
              change_type: 'Order Cancelled',
              quantity_changed: item.quantity,
              note: `Restored from cancelled order ${id}`
            }]);
          }
        }
        await supabase.from('order_timeline').insert([{
          order_id: id, event: 'Inventory Restored', note: 'Stock restored due to cancellation', created_by: 'admin'
        }]);
      }

      fetchOrderDetails();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTrackingUpdate = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('shipments').select('id').eq('order_id', id).single();
      if (existing) {
        await supabase.from('shipments').update({
          awb_code: trackingNumber, courier_name: courierName, updated_at: new Date().toISOString()
        }).eq('order_id', id);
      } else {
        await supabase.from('shipments').insert([{
          order_id: id, awb_code: trackingNumber, courier_name: courierName, status: 'Shipped'
        }]);
      }
      await supabase.from('order_timeline').insert([{
        order_id: id, event: 'Tracking Updated', note: `${courierName} - AWB: ${trackingNumber}`, created_by: 'admin'
      }]);
      fetchOrderDetails();
    } catch (err) {
      console.error('Error updating tracking:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-gray-500">Order not found.</div>;

  const shipping = order.shipping_details || {};
  const billing = order.billing_details || shipping;
  const customerName = order.customer_name || shipping.name || 'Guest';
  const customerEmail = order.customer_email || shipping.email || '';
  const customerPhone = order.customer_phone || shipping.phone || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order {order.id}</h1>
            <p className="text-sm text-gray-500">{format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            (order.payment_status || 'Pending') === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>{order.payment_status || 'Pending'}</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
            {order.order_status || order.status || 'Pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Products ({items.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b">
                    <th className="p-4 text-left">Product</th>
                    <th className="p-4 text-left">SKU</th>
                    <th className="p-4 text-left">Variant</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-right">Discount</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-4 font-medium text-gray-900">{item.product_name}</td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{item.sku || '—'}</td>
                      <td className="p-4 text-gray-600">{item.weight_label}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">₹{item.unit_price}</td>
                      <td className="p-4 text-right text-red-600">{item.discount ? `−₹${item.discount}` : '—'}</td>
                      <td className="p-4 text-right font-semibold">₹{item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50">
                  <tr><td colSpan="6" className="p-4 text-right text-gray-500">Subtotal</td><td className="p-4 text-right font-medium">₹{order.subtotal}</td></tr>
                  {order.discount_amount > 0 && <tr><td colSpan="6" className="px-4 pb-2 text-right text-green-600">Discount</td><td className="px-4 pb-2 text-right text-green-600">−₹{order.discount_amount}</td></tr>}
                  <tr><td colSpan="6" className="px-4 pb-2 text-right text-gray-500">Shipping</td><td className="px-4 pb-2 text-right">₹{order.shipping_fee || order.shipping || 0}</td></tr>
                  <tr><td colSpan="6" className="p-4 text-right font-bold text-gray-900">Grand Total</td><td className="p-4 text-right font-bold text-lg">₹{order.total}</td></tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Payment Details</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Payment Gateway</span><p className="font-medium mt-1">Razorpay</p></div>
              <div><span className="text-gray-500">Payment Method</span><p className="font-medium mt-1">{order.payment_method || 'Online'}</p></div>
              <div><span className="text-gray-500">Razorpay Payment ID</span><p className="font-mono text-xs mt-1">{payment?.razorpay_payment_id || order.payment_id || '—'}</p></div>
              <div><span className="text-gray-500">Razorpay Order ID</span><p className="font-mono text-xs mt-1">{payment?.razorpay_order_id || order.razorpay_order_id || '—'}</p></div>
              <div><span className="text-gray-500">Payment Date</span><p className="font-medium mt-1">{payment?.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy, hh:mm a') : '—'}</p></div>
              <div><span className="text-gray-500">Payment Status</span>
                <p className="mt-1"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(payment?.status || order.payment_status || 'Pending') === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{payment?.status || order.payment_status || 'Pending'}</span></p>
              </div>
            </div>
          </div>

          {/* Coupon */}
          {order.coupon_code && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Coupon Applied</h2>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Coupon Code</span><p className="font-mono font-bold mt-1 text-purple-700">{order.coupon_code}</p></div>
                <div><span className="text-gray-500">Discount Amount</span><p className="font-medium mt-1 text-green-600">−₹{order.discount_amount || 0}</p></div>
                <div><span className="text-gray-500">Discount Type</span><p className="font-medium mt-1">Applied at checkout</p></div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-5">
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-400">No timeline events yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {timeline.map((entry, i) => (
                      <div key={i} className="relative pl-10">
                        <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                          i === timeline.length - 1 ? 'bg-black border-black' : 'bg-white border-gray-300'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.event}</p>
                          {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(entry.created_at), 'dd MMM yyyy, hh:mm a')} • {entry.created_by || 'system'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div><span className="text-gray-500">Name</span><p className="font-medium">{customerName}</p></div>
              <div><span className="text-gray-500">Email</span><p className="font-medium">{customerEmail}</p></div>
              <div><span className="text-gray-500">Phone</span><p className="font-medium">{customerPhone}</p></div>
              {order.customer_id && (
                <button onClick={() => navigate(`/customers/${order.customer_id}`)}
                  className="text-xs text-blue-600 hover:underline">View Customer Profile →</button>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Shipping Address</h2>
            </div>
            <div className="p-5 text-sm text-gray-700 leading-relaxed">
              <p className="font-medium">{shipping.name}</p>
              <p>{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
              {shipping.landmark && <p>{shipping.landmark}</p>}
              <p>{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
              {shipping.phone && <p className="mt-2 text-gray-500">📞 {shipping.phone}</p>}
            </div>
          </div>

          {/* Update Order Status */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Update Status</h2>
            </div>
            <div className="p-5 space-y-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleStatusUpdate} disabled={saving || newStatus === (order.order_status || order.status)}
                className="w-full bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Tracking / Shipping */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Shipping & Tracking</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Courier Name</label>
                <input value={courierName} onChange={e => setCourierName(e.target.value)} placeholder="e.g. BlueDart, Delhivery"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tracking Number (AWB)</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. 12345678"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              {order.estimated_delivery && (
                <div className="text-xs text-gray-500">
                  Estimated Delivery: <span className="font-medium text-gray-700">{format(new Date(order.estimated_delivery), 'dd MMM yyyy')}</span>
                </div>
              )}
              <button onClick={handleTrackingUpdate} disabled={saving || (!trackingNumber && !courierName)}
                className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Tracking'}
              </button>
            </div>
          </div>

          {/* Invoice */}
          {invoice && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Invoice</h2>
              </div>
              <div className="p-5 text-sm space-y-2">
                <p><span className="text-gray-500">Invoice #:</span> <span className="font-mono font-medium">{invoice.invoice_number}</span></p>
                <p><span className="text-gray-500">Date:</span> {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}</p>
                <p><span className="text-gray-500">Status:</span> <span className="text-green-600 font-medium">{invoice.status}</span></p>
                <button onClick={() => navigate(`/invoices`)}
                  className="w-full mt-2 border border-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                  View All Invoices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
