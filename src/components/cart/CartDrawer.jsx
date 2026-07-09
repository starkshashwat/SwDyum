import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CartDrawer.css';

const FREE_SHIPPING_THRESHOLD = 799;

const UPSELL_PRODUCTS = [
  {
    slug: 'mango-pickle',
    name: 'Aam Ka Achar',
    price: 199,
    mrp: 250,
    image: '/prod_mango.webp',
    weight: '250g'
  },
  {
    slug: 'garlic-pickle',
    name: 'Spicy Garlic Pickle',
    price: 249,
    mrp: 300,
    image: '/cat_mango.webp',
    weight: '250g'
  }
];

// Apple-like cubic bezier
const drawerTransition = { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.32 };

const staggerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }),
  exit: { opacity: 0, height: 0, overflow: 'hidden', x: -20, transition: { duration: 0.2 } }
};

export default function CartDrawer({ isOpen, onClose, cart, updateCartQty, removeFromCart, addToCart, onNavigate }) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'WELCOME10') {
    discount = Math.round(subtotal * 0.1);
  }
  
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? 50 : 0);
  const total = subtotal - discount + shipping;

  const amountAway = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = (e) => {
    onClose();
    onNavigate('checkout');
  };

  const handleAddUpsell = (product) => {
    addToCart(product, product.weight, 1, 'One Time');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponCode('');
    } else {
      alert("Invalid coupon code. Try WELCOME10");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handlePopState = () => {
        onClose();
      };
      
      // Push a state so that back button doesn't leave the page immediately
      window.history.pushState({ drawerOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.drawerOpen) {
           window.history.back();
        }
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            className="cart-drawer"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={drawerTransition}
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <button className="continue-btn" onClick={onClose}>
                ← Continue Shopping
              </button>
              <h2>Your Cart ({totalItems})</h2>
              <button className="close-btn" onClick={onClose}>
                Close ✕
              </button>
            </div>

            {/* Progress Bar */}
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

            {/* Content Area (Scrollable) */}
            <div className="cart-drawer-content">
              {/* Cart Items */}
              <div className="cart-drawer-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <div className="empty-cart-illustration">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                    <h3>Your Cart is Empty</h3>
                    <p>Let's find something delicious.</p>
                    <button className="explore-btn" onClick={() => { onClose(); onNavigate('shop'); }}>
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {cart.map((item, idx) => {
                      const oldPrice = item.mrp || Math.round(item.price * 1.25);
                      const savings = oldPrice - item.price;
                      return (
                        <motion.div 
                          key={`${item.slug}-${item.weight}-${item.subscription}`} 
                          className="cart-drawer-item"
                          custom={idx}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={staggerVariants}
                          layout
                        >
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
                              <button className="remove-text-btn" onClick={() => removeFromCart(item.slug, item.weight, item.subscription)}>
                                🗑 Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
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
                      <motion.div 
                        className="coupon-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {appliedCoupon ? (
                          <div className="applied-coupon">
                            <span className="success-icon">✓</span>
                            <span><strong>{appliedCoupon}</strong> Applied</span>
                            <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>Remove</button>
                          </div>
                        ) : (
                          <form className="coupon-form" onSubmit={handleApplyCoupon}>
                            <input 
                              type="text" 
                              placeholder="Enter code (try WELCOME10)" 
                              value={couponCode} 
                              onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button type="submit" disabled={!couponCode}>Apply</button>
                          </form>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            {cart.length > 0 && (
              <div className="cart-drawer-sticky-footer">
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span>₹{shipping}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="summary-row discount-row">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <div className="trust-badges">
                  <span>🍃 100% Natural</span>
                  <span>🔒 Secure Payments</span>
                  <span>🔄 Easy Returns</span>
                </div>

                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                >
                  <span className="checkout-text">Proceed to Checkout</span>
                  <span className="checkout-total">₹{total}</span>
                </button>
                
                <p className="security-text">
                  🔒 Secure Checkout • SSL Protected
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
