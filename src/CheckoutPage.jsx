import React, { useState } from 'react';
import './CheckoutPage.css';
import { mockDb } from './mockDb';
import shiprocketApi from './shiprocketApi';

function CheckoutPage({ cart, clearCart, onNavigate, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || '',
    paymentMethod: 'cod',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [shiprocketError, setShiprocketError] = useState(null);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingThreshold = 500;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 60;
  const total = subtotal + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setShiprocketError(null);

    // Simulate brief payment processing delay
    await new Promise((r) => setTimeout(r, 1200));

    const paymentMethodsLabels = {
      cod: 'Cash on Delivery',
      upi: 'UPI / Scan QR Code',
      card: 'Credit or Debit Card',
      netbanking: 'Net Banking',
    };

    // ── Step 1: Save customer ──────────────────────────────────────────────
    const customerId = currentUser
      ? currentUser.id
      : `cust_${Date.now()}`;

    // ── Step 2: Create order in local DB ──────────────────────────────────
    setProcessingStep('Saving your order...');
    const newOrder = await mockDb.createOrder({
      customerId,
      items: cart,
      subtotal,
      shipping: shippingFee,
      total,
      paymentMethod: paymentMethodsLabels[formData.paymentMethod],
      shippingDetails: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
    });

    // ── Step 3: Sync with Shiprocket ──────────────────────────────────────
    setProcessingStep('Syncing with Shiprocket...');
    try {
      const srResult = await shiprocketApi.syncOrder(newOrder, formData);

      if (srResult.awb) {
        newOrder.trackingId = srResult.awb;
        newOrder.courierName = srResult.courierName;
        newOrder.labelUrl = srResult.labelUrl;
        newOrder.shipmentId = srResult.shipmentId;
        newOrder.shiprocketOrderId = srResult.shiprocketOrderId;

        // Persist tracking data back to local storage
        mockDb.updateLocalOrder(newOrder);
        console.log(`✅ Shiprocket AWB: ${srResult.awb} | Courier: ${srResult.courierName}`);
      }
    } catch (srErr) {
      console.warn('Shiprocket sync failed (order still saved):', srErr.message);
      setShiprocketError(srErr.message);
    }

    setPlacedOrder(newOrder);
    setIsProcessing(false);
    setProcessingStep('');
    clearCart();
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="checkout-page-wrapper">
        <div className="success-container">
          <div className="success-card">
            <div className="success-badge-glow">🏺</div>
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle-text">
              Thank you for supporting traditional Bihari culinary craftsmanship.
            </p>

            <div className="order-details-box">
              <h3>Order Details</h3>
              <div className="detail-row">
                <span className="label">Order Reference:</span>
                <span className="val highlight">{placedOrder.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Estimated Delivery:</span>
                <span className="val">3 – 5 Business Days</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="val">{placedOrder.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Amount:</span>
                <span className="val highlight">₹{placedOrder.total}</span>
              </div>

              {/* ── Shiprocket Tracking Block ─────────────────────────────── */}
              {placedOrder.trackingId && (
                <div className="shiprocket-success-block">
                  <div className="sr-block-header">
                    <span className="sr-logo-tag">🚚 Shiprocket</span>
                    <span className="sr-assigned-badge">AWB Assigned</span>
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
              )}

              {/* Shiprocket not yet configured notice */}
              {!placedOrder.trackingId && (
                <div className="sr-pending-notice">
                  {shiprocketError ? (
                    <>
                      <span>⚠️</span>
                      <div>
                        <strong>Shiprocket sync pending.</strong>
                        <p>Your order is saved. AWB will be assigned once Shiprocket credentials are configured in <code>.env</code>.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <div>
                        <strong>Awaiting AWB assignment.</strong>
                        <p>Shiprocket is processing your shipment. Check Order Details for tracking info shortly.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="success-address">
                <strong>Delivery Address:</strong>
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
                View Full Order & Tracking
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

  // ── Checkout Form ──────────────────────────────────────────────────────────
  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <div className="checkout-header">
          <span className="section-subtitle">~ Secure Checkout ~</span>
          <h1 className="section-headline">Finalize Details</h1>
          <p className="checkout-intro">
            Provide shipping instructions and complete your order.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-checkout-state">
            <h3>No items to check out</h3>
            <p>Your cart is currently empty. Go back and select some pickles before checkout.</p>
            <button className="back-btn" onClick={() => onNavigate('shop')}>
              Explore Shop
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* Left: Form */}
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit} className="premium-form">
                <h3 className="form-section-title">1. Shipping Address</h3>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
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
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? 'error-input' : ''}
                      placeholder="e.g. name@domain.com"
                    />
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? 'error-input' : ''}
                      placeholder="10-digit mobile number"
                    />
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={formErrors.address ? 'error-input' : ''}
                      placeholder="Street address, Apartment, Flat number"
                    />
                    {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                  </div>
                </div>

                <div className="form-row split-three">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={formErrors.city ? 'error-input' : ''}
                    />
                    {formErrors.city && <span className="error-text">{formErrors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={formErrors.state ? 'error-input' : ''}
                    />
                    {formErrors.state && <span className="error-text">{formErrors.state}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="zip">ZIP/PIN Code *</label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
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
                    { value: 'cod', icon: '💵', label: 'Cash on Delivery (COD)', desc: 'Pay in cash upon doorstep delivery' },
                    { value: 'upi', icon: '📱', label: 'UPI / Scan QR Code', desc: 'Pay instantly using PhonePe, GPay, or Paytm' },
                    { value: 'card', icon: '💳', label: 'Credit / Debit Card', desc: 'Secure payment using Visa, MasterCard, or RuPay' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`payment-option-card ${formData.paymentMethod === method.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
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

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-order-btn"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="loader-span">
                        <span className="spinner"></span>
                        {processingStep || 'Processing...'}
                      </span>
                    ) : (
                      `Place Order — ₹${total}`
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="checkout-summary-section">
              <div className="summary-sticky-card">
                <h3 className="summary-card-title">Order Items</h3>
                <div className="card-divider"></div>

                <div className="checkout-items-list">
                  {cart.map((item, idx) => (
                    <div key={`${item.slug}-${item.weight}-${idx}`} className="checkout-item-item">
                      <div className="item-thumbnail">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-name-weight">
                        <strong>{item.name}</strong>
                        <span>Size: {item.weight} | Qty: {item.quantity}</span>
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
                    <span>Shipping Fee</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>
                  <div className="card-divider"></div>
                  <div className="summary-row grand-total-row">
                    <strong>Total Amount</strong>
                    <strong className="grand-total-value">₹{total}</strong>
                  </div>
                </div>

                {/* Shiprocket badge */}
                <div className="sr-checkout-badge">
                  <span>🚚</span>
                  <div>
                    <strong>Powered by Shiprocket</strong>
                    <p>Fast pan-India delivery with live tracking</p>
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
