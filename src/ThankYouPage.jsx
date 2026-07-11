import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
        <div className="loading-spinner" role="status" aria-label="Loading your order" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="thank-you-wrapper">
        <motion.div
          className="thank-you-card error-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Hmm, we lost the receipt</h2>
          <p>We couldn't pull up your latest order right now — but don't worry, it was very likely placed successfully. Check your email for confirmation, or head back to the shop.</p>
          <motion.button className="return-home-btn" onClick={() => onNavigate('shop')} whileTap={{ scale: 0.97 }}>
            Back to Shop
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const shipping = orderData.shipping_details || {};

  return (
    <div className="thank-you-wrapper">
      <motion.div
        className="thank-you-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Confirmation header */}
        <div className="ty-header">
          <motion.div
            className="success-icon-wrapper"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="success-icon" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <motion.path
                d="M22 4L12 14.01l-3-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>

          <span className="ty-eyebrow">Order Confirmed</span>
          <h1 className="thank-you-title">Dhanyavaad — your order is in!</h1>
          <p className="thank-you-subtitle">
            Your jars of authentic Bihari achaar are being hand-packed with care and will be dispatched to you soon.
          </p>
        </div>

        <div className="order-details-box">
          <h3>Your Order Summary</h3>

          <div className="detail-row">
            <span className="label">Order ID</span>
            <span className="val highlight font-mono">{orderData.id}</span>
          </div>

          <div className="detail-row">
            <span className="label">Payment Status</span>
            <span className={`val ${orderData.payment_status === 'Paid' ? 'status-paid' : ''}`}>{orderData.payment_status || orderData.status}</span>
          </div>

          <div className="detail-row">
            <span className="label">Total Paid</span>
            <span className="val highlight font-bold">₹{orderData.total}</span>
          </div>

          <div className="detail-row">
            <span className="label">Estimated Delivery</span>
            <span className="val">{orderData.estimated_delivery ? new Date(orderData.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '3 – 5 Business Days'}</span>
          </div>
        </div>

        {orderItems && orderItems.length > 0 && (
          <div className="order-items-box">
            <h4>What's in the box</h4>
            <ul className="items-list">
              {orderItems.map((item, idx) => (
                <li key={idx} className="ty-item-row">
                  <div className="ty-item-info">
                    <p className="ty-item-name">{item.product_name}</p>
                    <p className="ty-item-sub">Qty {item.quantity} · {item.weight_label}</p>
                  </div>
                  <div className="ty-item-price">₹{item.total_price}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="shipping-box">
          <h4>Heading to</h4>
          <p className="ty-ship-name">{shipping.name || orderData.customer_name}</p>
          <p className="ty-ship-line">{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
          <p className="ty-ship-line">{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
          {shipping.phone && <p className="ty-ship-line ty-ship-phone">{shipping.phone}</p>}
        </div>

        <div className="action-buttons">
          <motion.button className="track-order-btn" onClick={() => onNavigate(`order-details-${orderData.id}`)} whileTap={{ scale: 0.98 }}>
            Track My Order
          </motion.button>
          <motion.button className="return-home-btn" onClick={() => onNavigate('shop')} whileTap={{ scale: 0.98 }}>
            Continue Shopping
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default ThankYouPage;
