import { getShippingFee } from './lib/shippingConstants';
import React, { useState, useCallback, useEffect } from 'react';
import './CheckoutPage.css';
import { supabase } from './supabaseClient';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    // Avoid duplicate script tags if invoked more than once.
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(!!window.Razorpay));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Retry the script load a couple of times — flaky networks shouldn't silently
// kill checkout. Resolves true once window.Razorpay is available.

/**
 * supabase.functions.invoke returns a generic FunctionsHttpError message
 * ("Edge Function returned a non-2xx status code") on 4xx/5xx. The real
 * message lives in error.context (the raw Response). Parse it so users and
 * logs see the actual failure reason.
 */
const extractEdgeFunctionError = async (invokeError, fallback) => {
    try {
        if (invokeError?.context?.json) {
            const body = await invokeError.context.json();
            if (body?.error) return body.error;
        }
    } catch { /* context already consumed or not JSON */ }
    return invokeError?.message || fallback;
};

const ensureRazorpayScript = async (retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ok = await loadRazorpayScript();
    if (ok && window.Razorpay) return true;
    if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
  }
  return false;
};

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
      discountAmount = Math.floor((subtotal * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.max_discount && discountAmount > appliedCoupon.max_discount) {
        discountAmount = appliedCoupon.max_discount;
      }
    } else if (appliedCoupon.discount_type === 'fixed') {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const shippingFee = getShippingFee(subtotal);
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

      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
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

  // The order row itself is created server-side by the `razorpay` edge
  // function (DB prices, server-computed totals). The client only saves
  // the address for future orders.
  const saveAddressForFuture = async () => {
    if (currentUser && currentUser.id) {
      try {
        const { data: existingAddrs } = await supabase.from('addresses')
          .select('id, pin_code, city, street, full_name, phone')
          .eq('customer_id', currentUser.id);

        const normalise = (s) => (s || '').trim().toLowerCase();
        const isDuplicate = (existingAddrs || []).some((a) =>
          normalise(a.phone) === normalise(formData.phone) &&
          normalise(a.pin_code) === normalise(formData.zip) &&
          normalise(a.city) === normalise(formData.city) &&
          normalise(a.street) === normalise(formData.address)
        );

        if (!isDuplicate) {
          await supabase.from('addresses').insert([{
            customer_id: currentUser.id,
            label: 'Home',
            full_name: formData.name,
            phone: formData.phone,
            email: formData.email,
            street: formData.address,
            city: formData.city,
            state: formData.state,
            pin_code: formData.zip,
            country: 'India',
            is_default: false
          }]);
        }
      } catch (e) { /* Address save is non-critical */ }
    }
  };

  const handlePrepaidFlow = async () => {
    setIsProcessing(true);
    setFulfillError(null);
    setProcessingStep('Initializing payment...');

    try {
      setProcessingStep('Loading secure payment gateway...');
      const res = await ensureRazorpayScript();
      if (!res || !window.Razorpay) {
        throw new Error('Could not load the payment gateway. Please check your internet connection and try again.');
      }

      setProcessingStep('Creating payment order...');
      const receiptId = `rcpt_${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: {
          action: 'create_order',
          // Items only — the server recomputes all amounts from DB prices
          items: cart.map((item) => ({ slug: item.slug, weight: item.weight, quantity: item.quantity })),
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          customer: formData,
          receipt: receiptId
        }
      });

      // supabase.functions.invoke returns an `error` only for transport-level
      // failures. A 4xx/5xx from the function still arrives as `data` with an
      // `error` field, so check both and surface the real message.
      if (error) throw new Error(await extractEdgeFunctionError(error, 'Payment service is unavailable.'));
      if (data?.error) throw new Error(data.error);
      if (!data?.order?.id || !data?.order_id) throw new Error('Payment order could not be created.');

      // If the server's authoritative total differs from what this page
      // displayed (price change, coupon state, stock), stop and let the
      // customer review instead of silently charging a different amount.
      const serverTotal = data.totals?.total;
      if (typeof serverTotal === 'number' && Math.abs(serverTotal - total) > 0.5) {
        throw new Error('The order total has changed (prices or coupon updated). Please review your cart and try again.');
      }

      const rzpOrderId = data.order.id;
      const internalOrderId = data.order_id;
      const backendKeyId = data.order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!backendKeyId) throw new Error('Payment key is not configured.');

      setProcessingStep('Preparing checkout...');
      saveAddressForFuture();

      const options = {
        key: backendKeyId,
        amount: Math.round((typeof serverTotal === 'number' ? serverTotal : total) * 100),
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
        theme: { color: '#0a5a32' },
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
            if (!verifyData.success) throw new Error(verifyData.error || 'Payment verification failed');

            // Order status is finalized server-side (payments row, invoice,
            // inventory, notifications) before this point.
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
          ondismiss: function () {
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
