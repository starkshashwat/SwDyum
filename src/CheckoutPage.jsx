import React, { useState, useCallback } from 'react';
import './CheckoutPage.css';
import { mockDb } from './mockDb';
import { supabase } from './supabaseClient';

// ─── Load Razorpay checkout script dynamically ────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ─── API Base ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function CheckoutPage({ cart, clearCart, onNavigate, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || '',
    paymentMethod: 'online',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [fulfillError, setFulfillError] = useState(null);

  // Cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 799 || subtotal === 0 ? 0 : 60;
  const isPrepaid = formData.paymentMethod !== 'cod';
  const codFee = !isPrepaid && subtotal > 0 ? 49 : 0;
  const total = subtotal + shippingFee + codFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?([0-9]\s?){10,12}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address.trim()) errors.address = 'Delivery address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim()) {
      errors.zip = 'ZIP/PIN code is required';
    } else if (!/^\d{6}$/.test(formData.zip)) {
      errors.zip = 'ZIP/PIN code must be exactly 6 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Shared: Save Order + Call Backend Fulfill Endpoint ────────────────────
  const saveAndFulfill = useCallback(async ({
    paymentMethod,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    const paymentLabels = {
      cod: 'Cash on Delivery',
      upi: 'UPI / Razorpay',
      card: 'Card / Razorpay',
      netbanking: 'Net Banking / Razorpay',
    };

    const customerId = currentUser ? currentUser.id : null;
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const shippingDetails = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
    };

    const finalPaymentMethod = paymentLabels[formData.paymentMethod] || formData.paymentMethod;

    // Simulate backend fulfill (mock Shiprocket)
    let awb = null;
    let courierName = null;
    
    setProcessingStep('Arranging mock shipment via Shiprocket...');
    try {
      await new Promise(r => setTimeout(r, 1000));
      awb = `AWB${Math.floor(Math.random() * 1000000000)}`;
      courierName = 'Delhivery Surface';
    } catch (err) {
      console.warn('Fulfillment mock failed:', err.message);
      setFulfillError(err.message);
    }

    setProcessingStep('Saving your order...');
    const orderData = {
      id: orderId,
      customer_id: customerId,
      subtotal,
      shipping_fee: shippingFee,
      cod_fee: codFee,
      discount_amount: 0,
      total,
      payment_method: finalPaymentMethod,
      payment_id: razorpay_payment_id || null,
      shipping_details: shippingDetails,
      status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      tracking_id: awb,
      courier_name: courierName
    };
    
    try {
      // 1. Insert Order
      const { error: orderError } = await supabase.from('orders').insert([orderData]);
      if (orderError) throw orderError;
      
      // 2. Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        product_name: item.name,
        weight_label: item.weight,
        subscription_type: item.subscription,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
      
    } catch (err) {
      console.error('Failed to save order to Supabase:', err);
      setFulfillError(`Database error: ${err.message}`);
      setIsProcessing(false);
      return;
    }

    setPlacedOrder({
      ...orderData,
      shippingDetails: shippingDetails, // expected by success screen
      paymentMethod: finalPaymentMethod,
      paymentId: razorpay_payment_id || null,
      trackingId: awb,
      courierName: courierName,
      labelUrl: null
    });

    setIsProcessing(false);
    setProcessingStep('');
    clearCart();
  }, [cart, currentUser, formData, subtotal, shippingFee, codFee, total, clearCart]);

  // ─── COD Flow: No payment needed ───────────────────────────────────────────
  const handleCodFlow = useCallback(async () => {
    setIsProcessing(true);
    setFulfillError(null);
    setProcessingStep('Confirming your order...');
    await new Promise((r) => setTimeout(r, 800)); // brief UX pause

    await saveAndFulfill({ paymentMethod: 'COD' });
  }, [saveAndFulfill]);

  // ─── Prepaid Flow: Razorpay → verify → fulfill ─────────────────────────────
  const handlePrepaidFlow = useCallback(async () => {
    setIsProcessing(true);
    setFulfillError(null);
    setProcessingStep('Initializing secure payment...');

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 2. Create order via Edge Function
      const receiptId = `receipt_${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: {
          action: 'create_order',
          amount: total,
          receipt: receiptId
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const orderId = data.order.id;
      // We pass the key directly in the frontend since it's a public key
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId'; 

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Swadyum',
        description: 'Authentic Bihari Pickles',
        image: '/logo-01.webp',
        order_id: orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#C1402B' // Swadyum brand color
        },
        handler: async function (response) {
           setProcessingStep('Verifying payment...');
           setIsProcessing(true);
           
           try {
             // 4. Verify Payment via Edge Function
             const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
               body: {
                 action: 'verify_payment',
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature
               }
             });
             
             if (verifyError) throw verifyError;
             if (verifyData?.error) throw new Error(verifyData.error);
             
             if (!verifyData.success) {
               throw new Error('Payment verification failed (Invalid signature)');
             }
             
             // 5. Success! Fulfill order
             await saveAndFulfill({
               paymentMethod: 'Prepaid',
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature,
             });
           } catch (err) {
             console.error('Verification error:', err);
             setFulfillError(`Payment verification failed: ${err.message}`);
             setIsProcessing(false);
           }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
         setFulfillError(`Payment failed: ${response.error.description}`);
         setIsProcessing(false);
      });
      rzp1.open();

    } catch (err) {
      console.error('Razorpay init error:', err);
      setFulfillError(err.message || 'Failed to initialize payment.');
      setIsProcessing(false);
    }
  }, [saveAndFulfill, total, formData]);

  // ─── Form Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await handlePrepaidFlow();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (placedOrder) {
    return (
      <div className="checkout-page-wrapper">
        <div className="success-container">
          <div className="success-card">
            <div className="success-badge-glow">🏺</div>
            <h1 className="success-title">Order Confirmed!</h1>
            <p className="success-subtitle-text">
              Thank you for supporting traditional Bihari culinary craftsmanship.
            </p>

            <div className="order-details-box">
              <h3>Order Summary</h3>
              <div className="detail-row">
                <span className="label">Order ID:</span>
                <span className="val highlight">{placedOrder.id}</span>
              </div>
              {placedOrder.paymentId && (
                <div className="detail-row">
                  <span className="label">Payment ID:</span>
                  <span className="val" style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    {placedOrder.paymentId}
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Payment Mode:</span>
                <span className="val">{placedOrder.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Paid:</span>
                <span className="val highlight">₹{placedOrder.total}</span>
              </div>
              <div className="detail-row">
                <span className="label">Estimated Delivery:</span>
                <span className="val">3 – 5 Business Days</span>
              </div>

              {/* ── Shiprocket Tracking ─────────────────────────────────── */}
              {placedOrder.trackingId ? (
                <div className="shiprocket-success-block">
                  <div className="sr-block-header">
                    <span className="sr-logo-tag">🚚 Shiprocket</span>
                    <span className="sr-assigned-badge">✓ Shipment Created</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Tracking Number (AWB):</span>
                    <span className="val highlight awb-code">{placedOrder.trackingId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Courier Partner:</span>
                    <span className="val">{placedOrder.courierName}</span>
                  </div>
                  {placedOrder.labelUrl && (
                    <a
                      className="label-download-btn"
                      href={placedOrder.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🏷️ Download Shipping Label (PDF)
                    </a>
                  )}
                </div>
              ) : (
                <div className="sr-pending-notice">
                  {fulfillError ? (
                    <>
                      <span>⚠️</span>
                      <div>
                        <strong>Awaiting AWB Assignment</strong>
                        <p>
                          Your order is saved and payment is confirmed. AWB will be assigned
                          shortly. You can check tracking in your account dashboard.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <div>
                        <strong>Setting up shipment...</strong>
                        <p>
                          Shiprocket is processing your order. Check Order Details for the
                          tracking number shortly.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="success-address">
                <strong>Delivering to:</strong>
                <p>{placedOrder.shippingDetails.name}</p>
                <p>{placedOrder.shippingDetails.address}</p>
                <p>
                  {placedOrder.shippingDetails.city}, {placedOrder.shippingDetails.state} –{' '}
                  {placedOrder.shippingDetails.zip}
                </p>
              </div>
            </div>

            <div className="success-footer">
              <button
                className="view-order-btn"
                onClick={() => onNavigate(`order-details-${placedOrder.id}`)}
              >
                Track My Order
              </button>
              <button className="continue-btn" onClick={() => onNavigate('shop')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECKOUT FORM
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <div className="checkout-header">
          <span className="section-subtitle">~ Secure Checkout ~</span>
          <h1 className="section-headline">Finalize Your Order</h1>
          <p className="checkout-intro">
            Enter your shipping details. Payment is processed securely.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-checkout-state">
            <h3>Your cart is empty</h3>
            <p>Go back and add some pickles to your order first.</p>
            <button className="back-btn" onClick={() => onNavigate('shop')}>
              Explore Shop
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* ── Left: Form ──────────────────────────────────────────── */}
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit} className="premium-form">

                <h3 className="form-section-title">1. Shipping Address</h3>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text" id="name" name="name"
                      value={formData.name} onChange={handleInputChange}
                      className={formErrors.name ? 'error-input' : ''}
                      placeholder="e.g. Siddharth Raj"
                    />
                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                  </div>
                </div>

                <div className="form-row split">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email" id="email" name="email"
                      value={formData.email} onChange={handleInputChange}
                      className={formErrors.email ? 'error-input' : ''}
                      placeholder="name@domain.com"
                    />
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel" id="phone" name="phone"
                      value={formData.phone} onChange={handleInputChange}
                      className={formErrors.phone ? 'error-input' : ''}
                      placeholder="10-digit mobile"
                    />
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address" name="address"
                      value={formData.address} onChange={handleInputChange}
                      className={formErrors.address ? 'error-input' : ''}
                      placeholder="Street, Flat No, Landmark"
                    />
                    {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                  </div>
                </div>

                <div className="form-row split-three">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text" id="city" name="city"
                      value={formData.city} onChange={handleInputChange}
                      className={formErrors.city ? 'error-input' : ''}
                    />
                    {formErrors.city && <span className="error-text">{formErrors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text" id="state" name="state"
                      value={formData.state} onChange={handleInputChange}
                      className={formErrors.state ? 'error-input' : ''}
                    />
                    {formErrors.state && <span className="error-text">{formErrors.state}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="zip">PIN Code *</label>
                    <input
                      type="text" id="zip" name="zip"
                      value={formData.zip} onChange={handleInputChange}
                      className={formErrors.zip ? 'error-input' : ''}
                      maxLength="6"
                    />
                    {formErrors.zip && <span className="error-text">{formErrors.zip}</span>}
                  </div>
                </div>

                <div className="form-divider"></div>

                <h3 className="form-section-title">2. Payment Method</h3>

                <div className="payment-options-list">
                  {[
                    { value: 'online', icon: '🔒', label: 'Secure Online Payment', desc: 'UPI, Cards, NetBanking via Razorpay' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`payment-option-card ${formData.paymentMethod === method.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio" name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleInputChange}
                      />
                      <div className="option-info">
                        <span className="option-icon">{method.icon}</span>
                        <div className="option-details">
                          <strong>{method.label}</strong>
                          <span>{method.desc}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Razorpay notice for prepaid */}
                {isPrepaid && (
                  <div className="razorpay-notice">
                    <span>🔒</span>
                    <div>
                      <strong>Secure Payment via Razorpay</strong>
                      <p>
                        Clicking "Pay Now" will open the Razorpay checkout modal.
                        Your payment will be verified before shipment is created.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error display */}
                {fulfillError && (
                  <div className="fulfill-error-banner">
                    ⚠️ {fulfillError}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-order-btn"
                    disabled={isProcessing}
                    id="place-order-btn"
                  >
                    {isProcessing ? (
                      <span className="loader-span">
                        <span className="spinner"></span>
                        {processingStep || 'Processing...'}
                      </span>
                    ) : isPrepaid ? (
                      `🔒 Pay Now — ₹${total}`
                    ) : (
                      `Place Order — ₹${total}`
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* ── Right: Order Summary ─────────────────────────────────── */}
            <div className="checkout-summary-section">
              <div className="summary-sticky-card">
                <h3 className="summary-card-title">Order Summary</h3>
                <div className="card-divider"></div>

                <div className="checkout-items-list">
                  {cart.map((item, idx) => (
                    <div key={`${item.slug}-${item.weight}-${item.subscription}-${idx}`} className="checkout-item-item">
                      <div className="item-thumbnail">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-name-weight">
                        <strong>{item.name}</strong>
                        <span>{item.weight} × {item.quantity} ({item.subscription})</span>
                      </div>
                      <div className="item-subtotal-price">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="card-divider"></div>

                <div className="checkout-summary-breakdown">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? '🎉 FREE' : `₹${shippingFee}`}</span>
                  </div>
                  {!isPrepaid && subtotal > 0 && (
                    <div className="summary-row">
                      <span>COD Fee</span>
                      <span>₹{codFee}</span>
                    </div>
                  )}
                  <div className="card-divider"></div>
                  <div className="summary-row grand-total-row">
                    <strong>Total</strong>
                    <strong className="grand-total-value">₹{total}</strong>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="trust-badges-grid">
                  <div className="trust-badge">
                    <span>🚚</span>
                    <p>Shiprocket Delivery</p>
                  </div>
                  <div className="trust-badge">
                    {isPrepaid ? <span>🔒</span> : <span>💵</span>}
                    <p>{isPrepaid ? 'Razorpay Secure' : 'COD Available'}</p>
                  </div>
                  <div className="trust-badge">
                    <span>📍</span>
                    <p>Live Tracking</p>
                  </div>
                </div>

                <button
                  className="back-to-cart-link"
                  type="button"
                  onClick={() => onNavigate('cart')}
                >
                  ← Back to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
