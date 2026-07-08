import React, { useState, useCallback, useEffect } from 'react';
import './CheckoutPage.css';
import { supabase } from './supabaseClient';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function CheckoutPage({ cart, clearCart, onNavigate, currentUser }) {
  // If cart is empty, redirect back to shop
  useEffect(() => {
    if (cart.length === 0) {
      onNavigate('shop');
    }
  }, [cart, onNavigate]);

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
  const [fulfillError, setFulfillError] = useState(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount && discountAmount > appliedCoupon.max_discount) {
        discountAmount = appliedCoupon.max_discount;
      }
    } else if (appliedCoupon.discount_type === 'fixed') {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const shippingFee = subtotal >= 799 || subtotal === 0 ? 0 : 60;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
        
      if (error || !data) throw new Error('Invalid or expired coupon');
      
      if (data.min_order_value && subtotal < data.min_order_value) {
        throw new Error(`Minimum order value is ₹${data.min_order_value}`);
      }
      
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        throw new Error('This coupon has expired');
      }
      
      setAppliedCoupon(data);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const useSavedAddress = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zip: currentUser.zip || '',
        paymentMethod: 'online',
      });
      setFormErrors({});
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^\+?([0-9]\s?){10,12}$/.test(formData.phone.replace(/\s+/g, ''))) errors.phone = 'Invalid phone';
    
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    
    if (!formData.zip.trim()) errors.zip = 'ZIP is required';
    else if (!/^\d{6}$/.test(formData.zip)) errors.zip = '6-digit ZIP required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createPendingOrder = async (razorpayOrderId) => {
    const customerId = currentUser ? currentUser.id : null;
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const shippingDetails = {
      name: formData.name, email: formData.email, phone: formData.phone,
      address: formData.address, city: formData.city, state: formData.state, zip: formData.zip
    };

    const orderData = {
      id: orderId,
      customer_id: customerId,
      subtotal,
      shipping_fee: shippingFee,
      cod_fee: 0,
      discount_amount: discountAmount,
      total,
      payment_method: 'Online / Razorpay',
      payment_id: razorpayOrderId, // Temporarily store RZP Order ID here
      shipping_details: shippingDetails,
      shipping: shippingFee, // Added to satisfy NOT NULL constraint on manual column
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      items: cart, // Added items to satisfy NOT NULL constraint
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const { error: orderError } = await supabase.from('orders').insert([orderData]);
    if (orderError) throw orderError;
    
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

    return orderId;
  };

  const handlePrepaidFlow = async () => {
    setIsProcessing(true);
    setFulfillError(null);
    setProcessingStep('Initializing payment...');

    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error('Failed to load payment gateway.');

      const receiptId = `rcpt_${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: { action: 'create_order', amount: total, receipt: receiptId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const rzpOrderId = data.order.id;
      
      setProcessingStep('Creating order...');
      const internalOrderId = await createPendingOrder(rzpOrderId);

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId'; 

      const options = {
        key: keyId,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Swadyum',
        description: 'Authentic Pickles',
        image: '/logo-01.webp',
        order_id: rzpOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: '#C1402B' },
        handler: async function (response) {
           setProcessingStep('Verifying payment...');
           setIsProcessing(true);
           try {
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
             if (!verifyData.success) throw new Error('Payment verification failed');
             
             setProcessingStep('Finalizing order...');
             
             // Update Order to Paid on Frontend (Webhook will also do this if frontend fails)
             await supabase.from('orders')
                .update({ status: 'Paid', payment_id: response.razorpay_payment_id })
                .eq('id', internalOrderId);

             clearCart();
             // Pass order ID via sessionStorage for ThankYouPage
             sessionStorage.setItem('lastCompletedOrder', internalOrderId);
             onNavigate('thank-you');
             
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
      console.error('Checkout error:', err);
      setFulfillError(err.message || 'Failed to initialize checkout.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await handlePrepaidFlow();
  };

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <h1 className="checkout-page-title">Checkout</h1>
        
        <div className="checkout-grid">
          {/* LEFT: Address Form */}
          <div className="checkout-form-section">
            <div className="form-header">
              <h2>Shipping Details</h2>
              {currentUser && (
                <button type="button" className="use-saved-btn" onClick={useSavedAddress}>
                  Autofill from Profile
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-row split">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={formErrors.name ? 'error-input' : ''} />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={formErrors.phone ? 'error-input' : ''} />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={formErrors.email ? 'error-input' : ''} />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Full Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className={formErrors.address ? 'error-input' : ''} rows="3" />
                  {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                </div>
              </div>

              <div className="form-row split-three">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={formErrors.city ? 'error-input' : ''} />
                  {formErrors.city && <span className="error-text">{formErrors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={formErrors.state ? 'error-input' : ''} />
                  {formErrors.state && <span className="error-text">{formErrors.state}</span>}
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className={formErrors.zip ? 'error-input' : ''} maxLength="6" />
                  {formErrors.zip && <span className="error-text">{formErrors.zip}</span>}
                </div>
              </div>

              {fulfillError && <div className="fulfill-error-banner">⚠️ {fulfillError}</div>}

              {/* Mobile Pay Button (Shows below form on mobile) */}
              <button type="submit" className="submit-order-btn mobile-only-pay" disabled={isProcessing}>
                {isProcessing ? (
                  <span className="loader-span"><span className="spinner"></span>{processingStep}</span>
                ) : (`Pay Now — ₹${total}`)}
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              <div className="summary-items-list">
                {cart.map((item, idx) => (
                  <div key={idx} className="summary-item">
                    <img src={item.image} alt={item.name} className="summary-img" />
                    <div className="summary-item-info">
                      <span className="summary-name">{item.name}</span>
                      <span className="summary-weight">{item.weight} x {item.quantity}</span>
                    </div>
                    <span className="summary-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="coupon-section">
                {!appliedCoupon ? (
                  <div className="coupon-input-group">
                    <input 
                      type="text" 
                      placeholder="Enter coupon code" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={isApplyingCoupon}
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon} 
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="apply-coupon-btn"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="applied-coupon-success">
                    <div className="coupon-tag">
                      <span className="coupon-icon">🏷️</span>
                      <strong>{appliedCoupon.code}</strong>
                    </div>
                    <button type="button" className="remove-coupon-btn" onClick={handleRemoveCoupon}>✕</button>
                  </div>
                )}
                {couponError && <span className="coupon-error-text">{couponError}</span>}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{Math.floor(discountAmount)}</span>
                  </div>
                )}
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              
              {/* Desktop Pay Button */}
              <button onClick={handleSubmit} className="submit-order-btn desktop-only-pay" disabled={isProcessing}>
                {isProcessing ? (
                  <span className="loader-span"><span className="spinner"></span>{processingStep}</span>
                ) : (`Pay Now — ₹${total}`)}
              </button>

              <div className="secure-badge">
                🔒 100% Secure Payment via Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
