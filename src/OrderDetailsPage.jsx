import React, { useState, useEffect } from 'react';
import './OrderDetailsPage.css';
import { supabase } from './supabaseClient';

function OrderDetailsPage({ onNavigate, orderId, currentUser }) {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // We extract the actual UUID if the route passes something like 'order-details-uuid'
  const cleanOrderId = orderId.replace('order-details-', '');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', cleanOrderId)
          .single();

        if (orderError) throw orderError;
        
        // Security check - ensure this order belongs to the current user (if logged in)
        // If not logged in, we still show it (guest checkout viewing from ThankYou page)
        if (currentUser && orderData.customer_id && orderData.customer_id !== currentUser.id) {
           throw new Error("Unauthorized");
        }

        setOrder(orderData);

        // Fetch items
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', cleanOrderId);
        
        setOrderItems(items || []);

        // Fetch timeline
        const { data: timelineData } = await supabase
          .from('order_timeline')
          .select('*')
          .eq('order_id', cleanOrderId)
          .order('created_at', { ascending: false });
          
        setTimeline(timelineData || []);

        // Fetch invoice
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('*')
          .eq('order_id', cleanOrderId)
          .single();
          
        setInvoice(invoiceData);

      } catch (e) {
        console.error("Error fetching order details:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [cleanOrderId, currentUser]);

  if (isLoading) {
    return (
      <div className="order-details-page-wrapper">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto', borderTopColor: 'var(--primary-green)' }}></div>
          <p style={{ color: 'var(--muted-text)', fontWeight: '600' }}>Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page-wrapper">
        <div className="order-not-found-card">
          <h2>Order Not Found</h2>
          <p>We couldn't retrieve details for order reference: <strong>#{cleanOrderId}</strong>.</p>
          <button className="back-btn" onClick={() => onNavigate('account')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // Timeline status logic
  const currentStatus = (order.order_status || order.status).toLowerCase();
  
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const shipping = order.shipping_details || {};
  const billing = order.billing_details || {};

  return (
    <div className="order-details-page-wrapper">
      <div className="details-container">

        {/* Breadcrumb */}
        <div className="details-breadcrumb">
          <span className="breadcrumb-link" onClick={() => onNavigate('account')}>Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Order #{cleanOrderId.split('-').slice(-2).join('-')}</span>
        </div>

        {/* Title & Actions */}
        <div className="order-title-actions-row">
          <div>
            <h1 className="order-main-title">Order Details</h1>
            <span className="order-timestamp">Placed on {formatDate(order.created_at)}</span>
          </div>
          <div className="action-buttons-group">
            <button className="btn-primary" onClick={() => onNavigate('account')}>← Dashboard</button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Status</p>
              <p className="font-bold text-lg">{order.order_status || order.status}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Status</p>
              <p className={`font-bold text-lg ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment_status}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="font-bold text-lg">₹{order.total}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Delivery</p>
              <p className="font-bold text-lg">{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD'}</p>
           </div>
        </div>

        {/* Order Tracking Timeline */}
        <section className="details-card timeline-card">
          <h3 className="card-sec-title">Tracking History</h3>
          {timeline.length === 0 ? (
             <p className="text-gray-500 italic p-4">No tracking updates available yet.</p>
          ) : (
             <div className="vertical-timeline-list px-4 py-2">
              {timeline.map((item, idx) => (
                <div key={idx} className={`vt-row ${idx === 0 ? 'vt-latest' : ''}`}>
                  <div className="vt-connector">
                    <div className="vt-dot"></div>
                    {idx < timeline.length - 1 && <div className="vt-line"></div>}
                  </div>
                  <div className="vt-content">
                    <strong className="vt-location text-gray-900">{item.status}</strong>
                    <span className="vt-status text-gray-600">{item.description}</span>
                    <span className="vt-time text-xs text-gray-400">{formatDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shipping details */}
        <section className="details-card">
           <h3 className="card-sec-title">Shipping Address</h3>
           <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-900">{shipping.name || order.customer_name}</p>
              <p className="text-gray-700">{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
              <p className="text-gray-700">{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
              <p className="text-gray-700 mt-2">📞 {shipping.phone || order.customer_phone}</p>
              <p className="text-gray-700">✉️ {shipping.email || order.customer_email}</p>
           </div>
        </section>

      </div>
    </div>
  );
}

export default OrderDetailsPage;
