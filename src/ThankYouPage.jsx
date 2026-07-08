import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './ThankYouPage.css';

function ThankYouPage({ onNavigate }) {
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We stored the internal order ID in sessionStorage right before navigating
    const id = sessionStorage.getItem('lastCompletedOrder');
    setOrderId(id);

    if (id) {
      const fetchOrder = async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
          
          if (!error && data) {
            setOrderData(data);
          }

          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);
          
          if (!itemsError && items) {
             setOrderItems(items);
          }

        } catch (err) {
          console.error("Failed to fetch order details", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="thank-you-wrapper">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="thank-you-wrapper">
        <div className="thank-you-card error-card">
          <h2>Oops!</h2>
          <p>We couldn't find your recent order details, but your order was likely processed successfully.</p>
          <button className="return-home-btn" onClick={() => onNavigate('shop')}>
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const shipping = orderData.shipping_details || {};

  return (
    <div className="thank-you-wrapper">
      <div className="thank-you-card">
        <div className="success-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" className="success-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="thank-you-title">Thank You for Your Order!</h1>
        <p className="thank-you-subtitle">
          Your authentic Bihari pickles will be freshly packed and dispatched soon.
        </p>

        <div className="order-details-box">
          <h3>Order Details</h3>
          
          <div className="detail-row">
            <span className="label">Order ID:</span>
            <span className="val highlight font-mono">{orderData.id}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className={`val ${orderData.payment_status === 'Paid' ? 'status-paid' : ''}`}>{orderData.payment_status || orderData.status}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Total Paid:</span>
            <span className="val highlight font-bold">₹{orderData.total}</span>
          </div>

          <div className="detail-row">
            <span className="label">Estimated Delivery:</span>
            <span className="val">{orderData.estimated_delivery ? new Date(orderData.estimated_delivery).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '3 – 5 Business Days'}</span>
          </div>
        </div>

        {orderItems && orderItems.length > 0 && (
          <div className="order-items-box">
             <h4>Items Ordered</h4>
             <ul className="items-list">
                {orderItems.map((item, idx) => (
                  <li key={idx} className="item-row flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                     <div>
                       <p className="font-medium">{item.product_name}</p>
                       <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.weight_label}</p>
                     </div>
                     <div className="font-medium">₹{item.total_price}</div>
                  </li>
                ))}
             </ul>
          </div>
        )}

        <div className="shipping-box">
          <h4>Shipping To:</h4>
          <p className="font-medium text-sm">{shipping.name || orderData.customer_name}</p>
          <p className="text-sm text-gray-600">{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
          <p className="text-sm text-gray-600">{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
          {shipping.phone && <p className="text-sm text-gray-600 mt-1">📞 {shipping.phone}</p>}
        </div>

        <div className="action-buttons">
          <button className="track-order-btn" onClick={() => onNavigate(`order-details-${orderData.id}`)}>
            Track My Order
          </button>
          <button className="return-home-btn" onClick={() => onNavigate('shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;
