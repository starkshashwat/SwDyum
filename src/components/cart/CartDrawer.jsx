import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CartDrawer.css';

const FREE_SHIPPING_THRESHOLD = 799;

const UPSELL_PRODUCTS = [
  {
    slug: 'mango-pickle',
    name: 'Aam Ka Achar',
    price: 199,
    image: '/prod_mango.webp',
    weight: '250g'
  },
  {
    slug: 'garlic-pickle',
    name: 'Spicy Garlic Pickle',
    price: 249,
    image: '/cat_mango.webp',
    weight: '250g'
  }
];

export default function CartDrawer({ isOpen, onClose, cart, updateCartQty, removeFromCart, addToCart, onNavigate }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const amountAway = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = (e) => {
    onClose();
    onNavigate('checkout');
  };

  const handleAddUpsell = (product) => {
    addToCart(product, product.weight, 1, 'One Time');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <button className="close-btn" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <h2>Shopping Bag ({totalItems})</h2>
              <div style={{width: 24}}></div> {/* spacer */}
            </div>

            {/* Progress Bar */}
            <div className="cart-drawer-progress">
              {amountAway > 0 ? (
                <p>Unlock Free gifts! You are <strong>₹{amountAway}</strong> away from free shipping</p>
              ) : (
                <p>Congratulations! You've unlocked <strong>Free Shipping!</strong></p>
              )}
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="progress-icons">
                <span className={subtotal >= 500 ? 'reached' : ''}>Free Gift</span>
                <span className={subtotal >= FREE_SHIPPING_THRESHOLD ? 'reached' : ''}>Free Shipping</span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-drawer-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Your shopping bag is empty.</p>
                  <button className="continue-shopping" onClick={() => { onClose(); onNavigate('shop'); }}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.slug}-${item.weight}-${idx}`} className="cart-drawer-item">
                    <img src={item.image} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-variant">{item.weight} • {item.subscription}</p>
                      <div className="item-price-row">
                        <span className="item-price">₹{item.price}</span>
                        <div className="item-qty-controls">
                          <button onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.slug, item.weight, item.subscription)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Upsells */}
            <div className="cart-drawer-upsells">
              <h3>You may also like</h3>
              <div className="upsells-scroll">
                {UPSELL_PRODUCTS.map((upsell) => (
                  <div key={upsell.slug} className="upsell-card">
                    <img src={upsell.image} alt={upsell.name} />
                    <div className="upsell-info">
                      <h4>{upsell.name}</h4>
                      <div className="upsell-price-row">
                        <span>₹{upsell.price}</span>
                        <button className="add-upsell" onClick={() => handleAddUpsell(upsell)}>Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="cart-drawer-footer">
              <div className="subtotal-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <p className="taxes-note">Taxes & shipping calculated at checkout</p>
              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                {`Checkout • ₹${subtotal}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
