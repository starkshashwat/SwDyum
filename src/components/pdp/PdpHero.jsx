import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpHero.css';

function PdpHero({ 
  product, 
  selectedSize, 
  setSelectedSize, 
  quantity, 
  setQuantity, 
  subscription, 
  setSubscription, 
  addToCart, 
  onNavigate,
  handleBuyNow,
  cart
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState(null);

  // Gallery images: primary image + placeholders for lifestyle, texture, etc.
  const gallery = product ? [
    product.image, 
    '/process_aging_1783263039730.png', 
    '/prod_mango.png', 
    '/editorial_spoon.png'
  ] : [];

  const handleCheckDelivery = () => {
    if (pincode.length >= 6) {
      const today = new Date();
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 4);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 7);

      const options = { month: 'short', day: 'numeric' };
      const minDateStr = minDate.toLocaleDateString('en-IN', options);
      const maxDateStr = maxDate.toLocaleDateString('en-IN', options);

      setDeliveryMsg(`Estimated Delivery: ${minDateStr} - ${maxDateStr}`);
    } else {
      setDeliveryMsg("Please enter a valid 6-digit PIN code.");
    }
  };

  if (!product) return null;

  // Calculate pricing
  const currentPrice = product.prices[selectedSize] || product.base_price;
  const mrp = Math.round(currentPrice * 1.35); // 35% markup for MRP
  const savings = mrp - currentPrice;
  const finalPrice = currentPrice;

  return (
    <section className="pdp-hero-container">
      {/* ─── LEFT: GALLERY (60%) ─── */}
      <div className="pdp-hero-gallery">
        <div className="pdp-gallery-inner">
          <div className="pdp-thumb-strip">
            {gallery.map((img, idx) => (
              <button 
                key={idx} 
                className={`pdp-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
                onMouseEnter={() => setActiveImageIndex(idx)}
              >
                <img src={img} alt={`View ${idx+1}`} />
              </button>
            ))}
          </div>

          <div className="pdp-main-image-wrap">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImageIndex}
                src={gallery[activeImageIndex]} 
                alt={product.name}
                className="pdp-main-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            
            {/* 360 View Badge Mock */}
            <div className="pdp-360-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 12a9.5 9.5 0 0 1-19 0M21.5 12a9.5 9.5 0 0 0-19 0"/><path d="M12 21.5c4 0 6.5-4.5 6.5-9.5S16 2.5 12 2.5 5.5 7 5.5 12s2.5 9.5 6.5 9.5z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: PRODUCT INFO (40%) ─── */}
      <div className="pdp-hero-info">
        <div className="pdp-breadcrumb">
          <button onClick={() => onNavigate('home')}>Home</button>
          <span className="sep">/</span>
          <button onClick={() => onNavigate('shop')}>Shop</button>
          <span className="sep">/</span>
          <span className="current">{product.name}</span>
        </div>

        <span className="pdp-category-eyebrow">Traditional Pickles</span>
        
        <h1 className="pdp-product-title">{product.name}</h1>
        
        <div className="pdp-rating-row">
          <div className="pdp-stars">★★★★★</div>
          <span className="pdp-rating-score">4.9</span>
          <span className="pdp-review-count">({product.reviewsCount || 2348} Reviews)</span>
        </div>

        <p className="pdp-short-story">
          {product.short_description || "Prepared using sun-ripened ingredients, cold-pressed mustard oil, and traditional Bihari spices. Every jar is handcrafted in small batches to preserve authentic taste."}
        </p>

        <div className="pdp-price-block">
          <div className="pdp-price-main">₹{finalPrice}</div>
          <div className="pdp-price-mrp">MRP ₹{mrp}</div>
          <div className="pdp-price-save">Save ₹{savings}</div>
        </div>

        <div className="pdp-badges-row">
          <span className="pdp-tag">100% Natural</span>
          <span className="pdp-tag">No Preservatives</span>
          <span className="pdp-tag">Handmade</span>
          <span className="pdp-tag">Sun-Cured</span>
        </div>

        {/* Variants */}
        <div className="pdp-selector-group">
          <label className="pdp-selector-label">Size</label>
          <div className="pdp-variant-selector">
            {Object.keys(product.prices).map(size => (
              <button 
                key={size}
                className={`pdp-variant-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>



        {/* Action Row */}
        <div className="pdp-action-row">
          <div className="pdp-qty-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button 
            className="pdp-add-btn"
            onClick={() => addToCart(product, selectedSize, quantity, subscription)}
          >
            Add to Cart
          </button>
        </div>
        
        <button 
          className="pdp-buy-btn"
          onClick={() => handleBuyNow(product, selectedSize, quantity, subscription)}
        >
          Buy Now
        </button>

        {/* Delivery Checker */}
        <div className="pdp-delivery-checker">
          <label className="pdp-selector-label">Delivery Checker</label>
          <div className="pdp-pincode-wrap">
            <input 
              type="text" 
              placeholder="Enter PIN Code" 
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              maxLength="6"
            />
            <button onClick={handleCheckDelivery}>Check</button>
          </div>
          {deliveryMsg && <div className="pdp-delivery-msg">{deliveryMsg}</div>}
        </div>

        {/* Trust Icons */}
        <div className="pdp-trust-icons">
          <div className="trust-icon-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Secure Checkout</span>
          </div>
          <div className="trust-icon-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            <span>Free Shipping Above ₹799</span>
          </div>
          <div className="trust-icon-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>COD Available</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default PdpHero;
