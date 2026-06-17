import React, { useState } from 'react';
import './CheckoutPage.css';
import { mockDb } from './mockDb';

function CheckoutPage({ cart, clearCart, onNavigate, currentUser }) {
  // Form states
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || '',
    paymentMethod: 'cod' // default
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingThreshold = 500;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 60;
  const total = subtotal + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate database write & payment authorization
    setTimeout(async () => {
      // 1. Save customer details / Get ID
      const customerId = currentUser ? currentUser.id : mockDb.saveCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip
      });

      // 2. Map payment label
      const paymentMethodsLabels = {
        cod: 'Cash on Delivery',
        upi: 'UPI / Scan QR Code',
        card: 'Credit or Debit Card',
        netbanking: 'Net Banking'
      };

      // 3. Create the order
      const newOrder = await mockDb.createOrder({
        customerId,
        items: cart,
        subtotal,
        shipping: shippingFee,
        total,
        paymentMethod: paymentMethodsLabels[formData.paymentMethod],
        shippingDetails: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        }
      });

      setPlacedOrder(newOrder);
      setIsProcessing(false);
      clearCart();
    }, 1800); // Luxury studio loader delay
  };

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
                <span className="val">3 - 5 Business Days</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="val">{placedOrder.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Amount:</span>
                <span className="val highlight">₹{placedOrder.total}</span>
              </div>
              
              <div className="success-address">
                <strong>Delivery Address:</strong>
                <p>{placedOrder.shippingDetails.name}</p>
                <p>{placedOrder.shippingDetails.address}</p>
                <p>{placedOrder.shippingDetails.city}, {placedOrder.shippingDetails.state} - {placedOrder.shippingDetails.zip}</p>
              </div>
            </div>

            <div className="success-footer">
              <button className="continue-btn" onClick={() => onNavigate('shop')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        
        {/* Header */}
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
            {/* Left: Checkout Shipping & Payment Form */}
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
                  <label className={`payment-option-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={formData.paymentMethod === 'cod'} 
                      onChange={handleInputChange}
                    />
                    <div className="option-info">
                      <span className="option-icon">💵</span>
                      <div className="option-details">
                        <strong>Cash on Delivery (COD)</strong>
                        <span>Pay in cash upon doorstep delivery</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option-card ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="upi" 
                      checked={formData.paymentMethod === 'upi'} 
                      onChange={handleInputChange}
                    />
                    <div className="option-info">
                      <span className="option-icon">📱</span>
                      <div className="option-details">
                        <strong>UPI / Scan QR Code</strong>
                        <span>Pay instantly using PhonePe, GPay, or Paytm</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option-card ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card" 
                      checked={formData.paymentMethod === 'card'} 
                      onChange={handleInputChange}
                    />
                    <div className="option-info">
                      <span className="option-icon">💳</span>
                      <div className="option-details">
                        <strong>Credit / Debit Card</strong>
                        <span>Secure payment using Visa, MasterCard, or RuPay</span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Submit button with simulation spinner */}
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-order-btn" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="loader-span">
                        <span className="spinner"></span> Processing Order...
                      </span>
                    ) : (
                      `Place Order - ₹${total}`
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right: Checkout Order Summary Panel */}
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
                      <div className="item-subtotal-price">
                        ₹{item.price * item.quantity}
                      </div>
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

                {/* Back to cart option */}
                <button className="back-to-cart-link" type="button" onClick={() => onNavigate('cart')}>
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
