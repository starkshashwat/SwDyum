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

  const handlePrintInvoice = () => {
    if (invoice && invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
      return;
    }
    window.print();
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
            <button className="btn-secondary" onClick={handlePrintInvoice}>🖨️ Print Invoice</button>
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

        {/* Printable Invoice Section */}
        <section className="invoice-print-sheet details-card">
          <div className="invoice-header">
            <div className="invoice-brand">
              <img src="/logo-01.webp" alt="Swadyum Logo" className="invoice-logo-img" />
              <p className="brand-tag">Artisanal Sun-Cured Heritage</p>
            </div>
            <div className="invoice-meta-info">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> {invoice?.invoice_number || `INV-${cleanOrderId.substring(0, 8).toUpperCase()}`}</p>
              <p><strong>Invoice Date:</strong> {formatDate(order.created_at).split(',')[0]}</p>
              <p><strong>Order Ref:</strong> {cleanOrderId}</p>
              {order.tracking_number && <p><strong>Tracking No:</strong> {order.tracking_number}</p>}
            </div>
          </div>

          <div className="invoice-divider"></div>

          <div className="invoice-addresses-row">
            <div className="address-block seller-block">
              <h4>Sold By:</h4>
              <strong>Swadyum Foods Private Limited</strong>
              <p>Plot 402, Fraser Road Corridor,</p>
              <p>Fraser Road, Patna, Bihar - 800001</p>
              <p><strong>GSTIN:</strong> 10AAECS1290K1Z9</p>
              <p><strong>FSSAI Lic:</strong> 10424000109281</p>
            </div>
            <div className="address-block buyer-block">
              <h4>Billing To:</h4>
              <strong>{billing.name || shipping.name || order.customer_name}</strong>
              <p>{billing.address || shipping.address || ''}</p>
              <p>{[billing.city || shipping.city, billing.state || shipping.state, billing.zip || shipping.zip].filter(Boolean).join(', ')}</p>
              <p><strong>Phone:</strong> {billing.phone || shipping.phone || order.customer_phone}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Item Description</th>
                <th>Weight / SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th className="align-right">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="item-name-col">
                    <strong>{item.product_name}</strong>
                    <span className="item-sub-desc">Artisanal Pickle</span>
                  </td>
                  <td>{item.weight_label} {item.sku ? `(${item.sku})` : ''}</td>
                  <td>₹{item.unit_price}</td>
                  <td>{item.quantity}</td>
                  <td className="align-right">₹{item.final_price || item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-totals-section">
            <div className="totals-table">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="totals-row">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}:</span>
                <span>-₹{order.discount_amount || 0}</span>
              </div>
              <div className="totals-row">
                <span>Delivery Charge:</span>
                <span>{order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}</span>
              </div>
              <div className="totals-row invoice-grand-total">
                <strong>Total Payable Amount:</strong>
                <strong>₹{order.total}</strong>
              </div>
            </div>
          </div>

          <div className="invoice-divider"></div>

          <div className="invoice-footer-terms">
            <p><strong>Payment Mode:</strong> {order.payment_method} (Status: {order.payment_status})</p>
            {order.payment_id && <p><strong>Transaction ID:</strong> {order.payment_id}</p>}
            <p>Thank you for choosing Swadyum Pickles. This is a computer-generated tax invoice and requires no signature.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
