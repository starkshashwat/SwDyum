import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import './CartDrawer.css';

const FREE_SHIPPING_THRESHOLD = 799;
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
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

const ensureRazorpayScript = async (retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ok = await loadRazorpayScript();
    if (ok && window.Razorpay) return true;
    if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
  }
  return false;
};

const UPSELL_PRODUCTS = [
  { slug: 'mango-pickle', name: 'Aam Ka Achar', price: 199, mrp: 250, image: '/prod_mango.webp', weight: '250g' },
  { slug: 'garlic-pickle', name: 'Spicy Garlic Pickle', price: 249, mrp: 300, image: '/cat_mango.webp', weight: '250g' }
];

const drawerTransition = { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.32 };

const staggerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }),
  exit: { opacity: 0, height: 0, overflow: 'hidden', x: -20, transition: { duration: 0.2 } }
};

export default function CartDrawer({
  isOpen, onClose, cart, updateCartQty, removeFromCart, addToCart, onNavigate,
  currentUser, clearCart, onOpenLogin
}) {
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Checkout form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [fulfillError, setFulfillError] = useState(null);

  // Coupon for checkout
  const [checkoutCoupon, setCheckoutCoupon] = useState(null);
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [checkoutCouponError, setCheckoutCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'WELCOME10') {
    discount = Math.round(subtotal * 0.1);
  }
  
  // Checkout-level coupon discount
  let checkoutDiscount = 0;
  if (checkoutCoupon) {
    if (checkoutCoupon.discount_type === 'percentage') {
      checkoutDiscount = (subtotal * checkoutCoupon.discount_value) / 100;
      if (checkoutCoupon.max_discount && checkoutDiscount > checkoutCoupon.max_discount) {
        checkoutDiscount = checkoutCoupon.max_discount;
      }
    } else if (checkoutCoupon.discount_type === 'fixed') {
      checkoutDiscount = checkoutCoupon.discount_value;
    }
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? 50 : 0);
  const cartTotal = subtotal - discount + shipping;
  const checkoutTotal = Math.max(0, subtotal - checkoutDiscount + shipping);
  const total = step === 'checkout' ? checkoutTotal : cartTotal;

  const amountAway = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Autofill form when entering checkout
  useEffect(() => {
    if (step === 'checkout' && currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zip: currentUser.zip || '',
      });
    }
  }, [step, currentUser]);

  // Reset step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('cart');
        setFulfillError(null);
        setFormErrors({});
      }, 350);
    }
  }, [isOpen]);

  const handleCheckout = () => {
    if (!currentUser) {
      onClose();
      onOpenLogin();
      return;
    }
    setStep('checkout');
  };

  const handleBackToCart = () => setStep('cart');

  const handleAddUpsell = (product) => {
    addToCart(product, product.weight, 1, 'One Time');
  };

  // Cart coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponCode('');
    } else {
      alert("Invalid coupon code. Try WELCOME10");
    }
  };
  const handleRemoveCoupon = () => setAppliedCoupon(null);

  // Checkout coupon (from DB)
  const handleApplyCheckoutCoupon = async (e) => {
    e.preventDefault();
    if (!checkoutCouponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCheckoutCouponError('');
    try {
      const { data, error } = await supabase
        .from('coupons').select('*')
        .eq('code', checkoutCouponCode.trim().toUpperCase())
        .eq('is_active', true).single();
      if (error || !data) throw new Error('Invalid or expired coupon');
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) throw new Error('This coupon has expired');
      setCheckoutCoupon(data);
      setCheckoutCouponCode('');
    } catch (err) {
      setCheckoutCouponError(err.message);
      setCheckoutCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  const handleRemoveCheckoutCoupon = () => { setCheckoutCoupon(null); setCheckoutCouponError(''); };

  // Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!formData.email.trim()) errors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.phone.trim()) errors.phone = 'Required';
    else if (!/^\+?([0-9]\s?){10,12}$/.test(formData.phone.replace(/\s+/g, ''))) errors.phone = 'Invalid phone';
    if (!formData.address.trim()) errors.address = 'Required';
    if (!formData.city.trim()) errors.city = 'Required';
    if (!formData.state.trim()) errors.state = 'Required';
    if (!formData.zip.trim()) errors.zip = 'Required';
    else if (!/^\d{6}$/.test(formData.zip)) errors.zip = '6-digit PIN';
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
      id: orderId, customer_id: customerId,
      customer_name: formData.name, customer_email: formData.email, customer_phone: formData.phone,
      subtotal, shipping_fee: shipping, cod_fee: 0, discount_amount: checkoutDiscount,
      total: checkoutTotal, payment_method: 'Online / Razorpay',
      payment_id: razorpayOrderId, razorpay_order_id: razorpayOrderId,
      shipping_details: shippingDetails, billing_details: shippingDetails, shipping: shipping,
      coupon_code: checkoutCoupon ? checkoutCoupon.code : null,
      items: cart, status: 'Pending', payment_status: 'Pending', order_status: 'Pending',
      checkout_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    let { error: orderError } = await supabase.from('orders').insert([orderData]);
    if (orderError && orderError.message && orderError.message.includes('orders_customer_id_fkey')) {
      orderData.customer_id = null;
      const retry = await supabase.from('orders').insert([orderData]);
      orderError = retry.error;
    }
    if (orderError) throw orderError;
    const orderItems = cart.map(item => ({
      order_id: orderId, product_name: item.name, weight_label: item.weight,
      sku: item.sku || '', subscription_type: item.subscription,
      quantity: item.quantity, unit_price: item.price,
      total_price: item.price * item.quantity, final_price: item.price * item.quantity
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    if (currentUser && currentUser.id) {
      try {
        const { data: existingAddrs } = await supabase.from('addresses')
          .select('id').eq('customer_id', currentUser.id);
        if (!existingAddrs || existingAddrs.length === 0) {
          await supabase.from('addresses').insert([{
            customer_id: currentUser.id, label: 'Home',
            full_name: formData.name, phone: formData.phone, email: formData.email,
            street: formData.address, city: formData.city, state: formData.state,
            pin_code: formData.zip, country: 'India', is_default: true
          }]);
        }
      } catch (e) { /* non-critical */ }
    }
    return orderId;
  };

  const handlePayNow = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);
    setFulfillError(null);
    setProcessingStep('Loading payment gateway...');
    try {
      const res = await ensureRazorpayScript();
      if (!res || !window.Razorpay) throw new Error('Could not load payment gateway.');
      setProcessingStep('Creating payment order...');
      const receiptId = `rcpt_${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: { action: 'create_order', amount: checkoutTotal, receipt: receiptId }
      });
      if (error) throw new Error(error.message || 'Payment service unavailable.');
      if (data?.error) throw new Error(data.error);
      if (!data?.order?.id) throw new Error('Payment order could not be created.');
      const rzpOrderId = data.order.id;
      const backendKeyId = data.order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!backendKeyId) throw new Error('Payment key not configured.');
      setProcessingStep('Creating order...');
      const internalOrderId = await createPendingOrder(rzpOrderId);
      const options = {
        key: backendKeyId, amount: Math.round(checkoutTotal * 100), currency: 'INR',
        name: 'Swadyum', description: 'Authentic Pickles', image: '/logo-01.webp',
        order_id: rzpOrderId,
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
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
            if (!verifyData.success) throw new Error('Payment verification failed');
            setProcessingStep('Finalizing order...');
            await supabase.from('orders')
              .update({ status: 'Paid', payment_id: response.razorpay_payment_id })
              .eq('id', internalOrderId);
            clearCart();
            sessionStorage.setItem('lastCompletedOrder', internalOrderId);
            onClose();
            onNavigate('thank-you');
          } catch (err) {
            setFulfillError(`Payment verification failed: ${err.message}`);
            setIsProcessing(false);
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', (response) => {
        setFulfillError(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp1.open();
    } catch (err) {
      setFulfillError(err.message || 'Failed to initialize checkout.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handlePopState = () => onClose();
      window.history.pushState({ drawerOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.drawerOpen) window.history.back();
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
          />
          
          <motion.div 
            className="cart-drawer"
            initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }} transition={drawerTransition}
          >
            {/* ─── HEADER ─── */}
            <div className="cart-drawer-header">
              {step === 'checkout' ? (
                <button className="continue-btn" onClick={handleBackToCart}>← Back to Cart</button>
              ) : (
                <button className="continue-btn" onClick={onClose}>← Continue Shopping</button>
              )}
              <h2>{step === 'checkout' ? 'Checkout' : `Your Cart (${totalItems})`}</h2>
              <button className="close-btn" onClick={onClose}>Close ✕</button>
            </div>

            {/* ─── PROGRESS BAR (Cart step only) ─── */}
            {step === 'cart' && (
              <div className="cart-drawer-progress">
                {amountAway > 0 ? (
                  <p>You're <strong>₹{amountAway}</strong> away from FREE Shipping</p>
                ) : (
                  <p className="success-text">✓ Congratulations! You unlocked FREE SHIPPING.</p>
                )}
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* ─── CONTENT AREA ─── */}
            <div className="cart-drawer-content">
              <AnimatePresence mode="wait">
                {step === 'cart' ? (
                  <motion.div key="cart-step" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    {/* Cart Items */}
                    <div className="cart-drawer-items">
                      {cart.length === 0 ? (
                        <div className="empty-cart">
                          <div className="empty-cart-illustration">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                          </div>
                          <h3>Your Cart is Empty</h3>
                          <p>Let's find something delicious.</p>
                          <button className="explore-btn" onClick={() => { onClose(); onNavigate('shop'); }}>Explore Collection</button>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {cart.map((item, idx) => {
                            const oldPrice = item.mrp || Math.round(item.price * 1.25);
                            const savings = oldPrice - item.price;
                            return (
                              <motion.div key={`${item.slug}-${item.weight}-${item.subscription}`} className="cart-drawer-item"
                                custom={idx} initial="hidden" animate="visible" exit="exit" variants={staggerVariants} layout>
                                <img src={item.image} alt={item.name} className="item-image" />
                                <div className="item-details">
                                  <h4>{item.name}</h4>
                                  <p className="item-variant">{item.weight} • {item.subscription}</p>
                                  <div className="item-price-row">
                                    <div className="price-container">
                                      <span className="item-price">₹{item.price}</span>
                                      {savings > 0 && (
                                        <>
                                          <span className="item-old-price">₹{oldPrice}</span>
                                          <span className="item-savings">Save ₹{savings}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <p className="delivery-eta">🚚 Estimated Delivery 3–5 Days</p>
                                  <div className="item-actions">
                                    <div className="item-qty-controls">
                                      <button onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity - 1)}>-</button>
                                      <span>{item.quantity}</span>
                                      <button onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity + 1)}>+</button>
                                    </div>
                                    <button className="remove-text-btn" onClick={() => removeFromCart(item.slug, item.weight, item.subscription)}>🗑 Remove</button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Upsells */}
                    {cart.length > 0 && (
                      <div className="cart-drawer-upsells">
                        <h3>Frequently Bought Together</h3>
                        <div className="upsells-scroll">
                          {UPSELL_PRODUCTS.map((upsell) => (
                            <div key={upsell.slug} className="upsell-card">
                              <img src={upsell.image} alt={upsell.name} />
                              <div className="upsell-info">
                                <h4>{upsell.name}</h4>
                                <p className="upsell-weight">{upsell.weight}</p>
                                <div className="upsell-price-row">
                                  <span>₹{upsell.price}</span>
                                  <button className="add-upsell" onClick={() => handleAddUpsell(upsell)}>Add</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coupon Section */}
                    {cart.length > 0 && (
                      <div className="coupon-section">
                        <button className="coupon-toggle" onClick={() => setIsCouponOpen(!isCouponOpen)}>
                          <span>Have a Coupon?</span>
                          <span className={`chevron ${isCouponOpen ? 'open' : ''}`}>▼</span>
                        </button>
                        <AnimatePresence>
                          {isCouponOpen && (
                            <motion.div className="coupon-content"
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                              {appliedCoupon ? (
                                <div className="applied-coupon">
                                  <span className="success-icon">✓</span>
                                  <span><strong>{appliedCoupon}</strong> Applied</span>
                                  <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>Remove</button>
                                </div>
                              ) : (
                                <form className="coupon-form" onSubmit={handleApplyCoupon}>
                                  <input type="text" placeholder="Enter code (try WELCOME10)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                  <button type="submit" disabled={!couponCode}>Apply</button>
                                </form>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ─── CHECKOUT STEP ─── */
                  <motion.div key="checkout-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                    {/* Collapsible mini order summary */}
                    <div className="checkout-mini-summary">
                      <button className="mini-summary-toggle" onClick={() => setShowOrderSummary(!showOrderSummary)}>
                        <span>Order Summary ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                        <span className={`chevron ${showOrderSummary ? 'open' : ''}`}>▼</span>
                      </button>
                      <AnimatePresence>
                        {showOrderSummary && (
                          <motion.div className="mini-summary-items"
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                            {cart.map((item, idx) => (
                              <div key={idx} className="mini-item">
                                <img src={item.image} alt={item.name} />
                                <div className="mini-item-info">
                                  <span className="mini-item-name">{item.name}</span>
                                  <span className="mini-item-meta">{item.weight} × {item.quantity}</span>
                                </div>
                                <span className="mini-item-price">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Shipping Form */}
                    <div className="checkout-form-drawer">
                      <h3 className="form-section-title">Shipping Details</h3>

                      {currentUser && (
                        <button type="button" className="autofill-btn" onClick={() => {
                          setFormData({
                            name: currentUser.name || '', email: currentUser.email || '',
                            phone: currentUser.phone || '', address: currentUser.address || '',
                            city: currentUser.city || '', state: currentUser.state || '', zip: currentUser.zip || '',
                          });
                          setFormErrors({});
                        }}>
                          ✨ Autofill from Profile
                        </button>
                      )}

                      <form onSubmit={handlePayNow} className="drawer-checkout-form">
                        <div className="form-row-drawer split">
                          <div className="field-group">
                            <label>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                              className={formErrors.name ? 'error' : ''} placeholder="Your name" />
                            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                          </div>
                          <div className="field-group">
                            <label>Phone</label>
                            <input type="tel" name="phone" inputMode="tel" value={formData.phone} onChange={handleInputChange}
                              className={formErrors.phone ? 'error' : ''} placeholder="+91 XXXXXXXXXX" />
                            {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                          </div>
                        </div>

                        <div className="field-group">
                          <label>Email</label>
                          <input type="email" name="email" inputMode="email" value={formData.email} onChange={handleInputChange}
                            className={formErrors.email ? 'error' : ''} placeholder="you@email.com" />
                          {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                        </div>

                        <div className="field-group">
                          <label>Address</label>
                          <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange}
                            className={formErrors.address ? 'error' : ''} placeholder="House/flat no., street, landmark..." />
                          {formErrors.address && <span className="field-error">{formErrors.address}</span>}
                        </div>

                        <div className="form-row-drawer triple">
                          <div className="field-group">
                            <label>City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                              className={formErrors.city ? 'error' : ''} placeholder="City" />
                            {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                          </div>
                          <div className="field-group">
                            <label>State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                              className={formErrors.state ? 'error' : ''} placeholder="State" />
                            {formErrors.state && <span className="field-error">{formErrors.state}</span>}
                          </div>
                          <div className="field-group">
                            <label>PIN</label>
                            <input type="text" name="zip" inputMode="numeric" maxLength="6" value={formData.zip} onChange={handleInputChange}
                              className={formErrors.zip ? 'error' : ''} placeholder="6-digit" />
                            {formErrors.zip && <span className="field-error">{formErrors.zip}</span>}
                          </div>
                        </div>

                        {/* Checkout coupon */}
                        <div className="drawer-coupon-section">
                          {!checkoutCoupon ? (
                            <div className="drawer-coupon-row">
                              <input type="text" placeholder="Coupon code" value={checkoutCouponCode}
                                onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())} disabled={isApplyingCoupon} />
                              <button type="button" onClick={handleApplyCheckoutCoupon}
                                disabled={!checkoutCouponCode.trim() || isApplyingCoupon}>
                                {isApplyingCoupon ? '...' : 'Apply'}
                              </button>
                            </div>
                          ) : (
                            <div className="drawer-coupon-applied">
                              <span>🏷️ <strong>{checkoutCoupon.code}</strong></span>
                              <button type="button" onClick={handleRemoveCheckoutCoupon}>✕</button>
                            </div>
                          )}
                          {checkoutCouponError && <span className="field-error">{checkoutCouponError}</span>}
                        </div>

                        {fulfillError && <div className="drawer-error-banner">⚠️ {fulfillError}</div>}
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── STICKY FOOTER ─── */}
            {cart.length > 0 && (
              <div className="cart-drawer-sticky-footer">
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal</span><span>₹{subtotal}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="summary-row"><span>Shipping</span><span>₹{shipping}</span></div>
                  )}
                  {step === 'cart' && discount > 0 && (
                    <div className="summary-row discount-row"><span>Discount</span><span>-₹{discount}</span></div>
                  )}
                  {step === 'checkout' && checkoutDiscount > 0 && (
                    <div className="summary-row discount-row"><span>Discount ({checkoutCoupon.code})</span><span>-₹{Math.floor(checkoutDiscount)}</span></div>
                  )}
                  <div className="summary-row total-row">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>

                <div className="trust-badges">
                  <span>🍃 100% Natural</span>
                  <span>🔒 Secure Payments</span>
                </div>

                {step === 'cart' ? (
                  <button className="checkout-btn" onClick={handleCheckout}>
                    <span className="checkout-text">Proceed to Checkout</span>
                    <span className="checkout-total">₹{total}</span>
                  </button>
                ) : (
                  <button className="checkout-btn pay-now-btn" onClick={handlePayNow} disabled={isProcessing}>
                    {isProcessing ? (
                      <span className="loader-span"><span className="spinner" />{processingStep}</span>
                    ) : (
                      <>
                        <span className="checkout-text">Pay Now</span>
                        <span className="checkout-total">₹{checkoutTotal}</span>
                      </>
                    )}
                  </button>
                )}

                <p className="security-text">🔒 Secure Checkout • SSL Protected</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
