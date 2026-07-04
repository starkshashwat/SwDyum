import React, { useState } from 'react';
import './CartPage.css';

function CartPage({ cart, updateCartQty, removeFromCart, onNavigate }) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingThreshold = 799;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 60;
  const total = subtotal + shippingFee;

  const handleFastrrCheckout = async (e) => {
    e.preventDefault();
    setIsCheckoutLoading(true);

    try {
      const fastrrItems = cart.map(item => ({
        variant_id: item.slug, // Pass slug as variant_id
        quantity: item.quantity
      }));

      const res = await fetch('http://localhost:3001/api/fastrr/access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_data: { items: fastrrItems },
          redirect_url: window.location.origin
        })
      });

      const data = await res.json();

      if (data.token) {
        if (window.HeadlessCheckout) {
          window.HeadlessCheckout.addToCart(e, data.token, { fallbackUrl: window.location.origin });
        } else {
          alert('Shiprocket Fastrr Checkout SDK not loaded. Check console.');
        }
      } else {
        alert(data.error || 'Failed to initialize Fastrr Checkout.');
      }
    } catch (err) {
      console.error('Fastrr error:', err);
      alert('Network error during checkout initialization.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        {/* Editorial Header */}
        <div className="cart-header">
          <span className="section-subtitle">~ Your Selections ~</span>
          <h1 className="section-headline">Shopping Cart</h1>
          <p className="cart-intro-text">
            Review your handcrafted Bihari pickles before proceeding to secure checkout.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <div className="empty-icon-glow">🏺</div>
            <h3>Your Cart is Empty</h3>
            <p>You haven't added any of our traditional sun-cured pickles to your cart yet.</p>
            <button className="continue-shopping-btn" onClick={() => onNavigate('shop')}>
              Explore Our Collection ➔
            </button>
          </div>
        ) : (
          <div className="cart-content-layout">
            {/* Left Column: Cart Items List */}
            <div className="cart-items-section">
              <div className="cart-items-header">
                <span className="col-header product-col">Product</span>
                <span className="col-header price-col">Price</span>
                <span className="col-header qty-col">Quantity</span>
                <span className="col-header total-col">Total</span>
              </div>

              <div className="cart-items-list">
                {cart.map((item, idx) => (
                  <div key={`${item.slug}-${item.weight}-${item.subscription}-${idx}`} className="cart-item-row">
                    {/* Product cell */}
                    <div className="cart-item-product">
                      <div className="cart-item-img-container" onClick={() => onNavigate(`product-${item.slug}`)}>
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-details">
                        <h4 className="cart-item-title" onClick={() => onNavigate(`product-${item.slug}`)}>
                          {item.name}
                        </h4>
                        <span className="cart-item-weight">Net Weight: {item.weight} | Delivery: {item.subscription}</span>
                        <button 
                          className="cart-remove-btn" 
                          onClick={() => removeFromCart(item.slug, item.weight, item.subscription)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Unit price cell */}
                    <div className="cart-item-price">
                      <span className="mobile-only-label">Price:</span>
                      <span>₹{item.price}</span>
                    </div>

                    {/* Quantity Selector cell */}
                    <div className="cart-item-qty">
                      <span className="mobile-only-label">Qty:</span>
                      <div className="cart-qty-counter">
                        <button 
                          className="qty-adjust-btn" 
                          onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          className="qty-adjust-btn" 
                          onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Item Total cell */}
                    <div className="cart-item-total">
                      <span className="mobile-only-label">Total:</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Back to Shop Navigation */}
              <div className="cart-actions-footer">
                <button className="back-to-shop-btn" onClick={() => onNavigate('shop')}>
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* Right Column: Cart Summary Card */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">₹{subtotal}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Delivery Fee</span>
                  <span className="summary-value">
                    {shippingFee === 0 ? <span className="free-shipping">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <div className="shipping-progress-tip">
                    Add <strong>₹{shippingThreshold - subtotal}</strong> more for <strong>FREE Delivery</strong>!
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row grand-total-row">
                  <span className="total-label">Grand Total</span>
                  <span className="total-value">₹{total}</span>
                </div>

                <button 
                  className="checkout-cta-btn" 
                  onClick={handleFastrrCheckout}
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? 'Initializing Secure Checkout...' : 'Proceed to Secure Checkout 🔒'}
                </button>

                {/* Trust Badges */}
                <div className="checkout-trust-indicators">
                  <div className="badge-item">
                    <span className="badge-icon">🌿</span>
                    <span>100% Sun-Cured & Natural</span>
                  </div>
                  <div className="badge-item">
                    <span className="badge-icon">🛡️</span>
                    <span>Safe & Secure Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
