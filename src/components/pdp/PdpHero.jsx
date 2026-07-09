import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpHero.css';

const SpiceLevels = [
  { id: 'mild', label: 'Mild', emoji: '🌶️', desc: 'Gentle warmth' },
  { id: 'medium', label: 'Medium', emoji: '🌶️🌶️', desc: 'Balanced heat' },
  { id: 'hot', label: 'Hot', emoji: '🌶️🌶️🌶️', desc: 'Bold & fiery' },
];

const Benefits = [
  { icon: '🌿', title: '100% Natural', sub: 'No preservatives' },
  { icon: '👵', title: 'Grandma Recipe', sub: 'Small-batch craft' },
  { icon: '☀️', title: 'Sun-Cured', sub: 'Authentic taste' },
  { icon: '🚚', title: 'Fast Dispatch', sub: 'Ships in 24 hrs' },
];

function PdpHero({
  product,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  subscription,
  addToCart,
  onNavigate,
  handleBuyNow,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState(null);
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Gallery: real product images first, then lifestyle/process fallbacks
  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = (product.images && product.images.length > 0)
      ? product.images
      : [product.image];
    const extras = [
      '/process_aging_1783263039730.webp',
      '/process_mixing_1783263028798.webp',
      '/process_suncured_1783263051169.webp',
    ];
    const merged = [...imgs];
    extras.forEach((e) => { if (!merged.includes(e)) merged.push(e); });
    return merged.slice(0, 5);
  }, [product]);

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
      setDeliveryMsg(`Get it by ${minDateStr} - ${maxDateStr}`);
    } else {
      setDeliveryMsg('Please enter a valid 6-digit PIN code.');
    }
  };

  const handleAdd = () => {
    if (added || adding) return;
    setAdding(true);
    setTimeout(() => {
      addToCart(product, selectedSize, quantity, subscription);
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }, 350);
  };

  if (!product) return null;

  const currentPrice = product.prices[selectedSize] || product.base_price;
  const variant = (product.variants || []).find((v) => v.weight_label === selectedSize);
  const mrp = variant?.mrp || Math.round(currentPrice * 1.35);
  const savings = Math.max(0, mrp - currentPrice);
  const discountPct = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;
  const outOfStock = variant?.stock_quantity !== undefined && variant.stock_quantity <= 0;
  const lowStock = variant?.stock_quantity !== undefined && variant.stock_quantity > 0 && variant.stock_quantity <= 8;
  const finalPrice = currentPrice * quantity;
  const unitPrice = currentPrice;

  return (
    <section className="pdp-hero" aria-label="Product overview">
      {/* Offer strip */}
      <div className="pdp-offer-strip" role="status">
        <span className="pdp-offer-pulse" aria-hidden="true" />
        <span className="pdp-offer-text">
          {discountPct > 0 ? `Flat ${discountPct}% OFF · ` : ''}Free shipping above ₹799 · COD available
        </span>
      </div>

      <div className="pdp-hero-grid">
        {/* ─── LEFT: GALLERY ─── */}
        <div className="pdp-gallery">
          <div className="pdp-gallery-stage">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={gallery[activeImageIndex]}
                alt={product.name}
                className="pdp-main-image"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>

            {discountPct > 0 && (
              <div className="pdp-discount-badge">
                <span className="pdp-discount-pct">{discountPct}%</span>
                <span className="pdp-discount-label">OFF</span>
              </div>
            )}

            <div className="pdp-gallery-badge pdp-gallery-badge--360" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 12a9.5 9.5 0 0 1-19 0M21.5 12a9.5 9.5 0 0 0-19 0" />
                <path d="M12 21.5c4 0 6.5-4.5 6.5-9.5S16 2.5 12 2.5 5.5 7 5.5 12s2.5 9.5 6.5 9.5z" />
              </svg>
            </div>
          </div>

          <div className="pdp-thumbs" role="tablist" aria-label="Product images">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                className={`pdp-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
                onMouseEnter={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-selected={activeImageIndex === idx}
                role="tab"
              >
                <img src={img} alt={`View ${idx + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: INFO ─── */}
        <div className="pdp-info">
          <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="sep">/</span>
            <button onClick={() => onNavigate('shop')}>Shop</button>
            <span className="sep">/</span>
            <span className="current">{product.name}</span>
          </nav>

          <div className="pdp-title-row">
            <span className="pdp-eyebrow">Traditional Pickles</span>
            <h1 className="pdp-title">{product.name}</h1>
          </div>

          <div className="pdp-rating-row">
            <div className="pdp-stars" aria-hidden="true">★★★★★</div>
            <span className="pdp-rating-score">{product.rating || 4.9}</span>
            <button className="pdp-review-link" onClick={() => document.getElementById('pdp-reviews')?.scrollIntoView({ behavior: 'smooth' })}>
              ({(product.reviewsCount || 2348).toLocaleString('en-IN')} reviews)
            </button>
            <span className="pdp-verified">✓ Verified</span>
          </div>

          <p className="pdp-story">
            {product.short_description ||
              'Prepared using sun-ripened ingredients, cold-pressed mustard oil, and traditional Bihari spices. Every jar is handcrafted in small batches to preserve authentic taste.'}
          </p>

          {/* Benefit chips */}
          <div className="pdp-benefits">
            {Benefits.map((b) => (
              <div className="pdp-benefit" key={b.title}>
                <span className="pdp-benefit-icon" aria-hidden="true">{b.icon}</span>
                <span className="pdp-benefit-text">
                  <strong>{b.title}</strong>
                  <small>{b.sub}</small>
                </span>
              </div>
            ))}
          </div>

          {/* Price block */}
          <div className="pdp-price-block">
            <div className="pdp-price-main">₹{unitPrice}</div>
            {mrp > unitPrice && <div className="pdp-price-mrp">₹{mrp}</div>}
            {savings > 0 && (
              <div className="pdp-price-save">
                Save ₹{savings}
              </div>
            )}
            <div className="pdp-price-unit">/ {selectedSize}</div>
          </div>

          {/* Urgency */}
          {(lowStock || outOfStock) && (
            <div className={`pdp-urgency ${outOfStock ? 'out' : 'low'}`}>
              <span className="pdp-urgency-dot" aria-hidden="true" />
              {outOfStock
                ? 'Out of stock — notify me when available'
                : `Hurry! Only ${variant.stock_quantity} left in stock`}
            </div>
          )}

          {/* Size selector */}
          <div className="pdp-selector-group">
            <div className="pdp-selector-head">
              <label className="pdp-selector-label">Choose Size</label>
              <span className="pdp-selector-hint">Best value: 1kg</span>
            </div>
            <div className="pdp-variant-selector" role="radiogroup" aria-label="Size">
              {Object.keys(product.prices).map((size) => {
                const v = (product.variants || []).find((x) => x.weight_label === size);
                const soldOut = v?.stock_quantity !== undefined && v.stock_quantity <= 0;
                return (
                  <button
                    key={size}
                    className={`pdp-variant-btn ${selectedSize === size ? 'active' : ''} ${soldOut ? 'soldout' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    disabled={soldOut}
                    role="radio"
                    aria-checked={selectedSize === size}
                  >
                    <span className="pdp-variant-size">{size}</span>
                    <span className="pdp-variant-price">₹{product.prices[size]}</span>
                    {soldOut && <span className="pdp-variant-sold">Sold out</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spice level */}
          <div className="pdp-selector-group">
            <label className="pdp-selector-label">Spice Level</label>
            <div className="pdp-spice-selector" role="radiogroup" aria-label="Spice level">
              {SpiceLevels.map((s) => (
                <button
                  key={s.id}
                  className={`pdp-spice-btn ${spiceLevel === s.id ? 'active' : ''}`}
                  onClick={() => setSpiceLevel(s.id)}
                  role="radio"
                  aria-checked={spiceLevel === s.id}
                >
                  <span className="pdp-spice-emoji" aria-hidden="true">{s.emoji}</span>
                  <span className="pdp-spice-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="pdp-action-row">
            <div className="pdp-qty-selector" role="group" aria-label="Quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
              <span aria-live="polite">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
            </div>
            <motion.button
              className={`pdp-add-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={outOfStock || adding}
              whileTap={{ scale: 0.96 }}
              animate={added ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    ✓ Added
                  </motion.span>
                ) : adding ? (
                  <motion.span key="adding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Adding…
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <motion.button
            className="pdp-buy-btn"
            onClick={() => handleBuyNow(product, selectedSize, quantity, subscription)}
            disabled={outOfStock}
            whileTap={{ scale: 0.98 }}
          >
            <span>Buy Now</span>
            <span className="pdp-buy-price">₹{finalPrice}</span>
          </motion.button>

          {/* Delivery checker */}
          <div className="pdp-delivery-checker">
            <label className="pdp-selector-label">Check Delivery</label>
            <div className="pdp-pincode-wrap">
              <input
                type="text"
                placeholder="Enter PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                maxLength="6"
                aria-label="PIN code"
              />
              <button onClick={handleCheckDelivery}>Check</button>
            </div>
            <AnimatePresence>
              {deliveryMsg && (
                <motion.div
                  className="pdp-delivery-msg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {deliveryMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust badges */}
          <div className="pdp-trust-icons">
            <div className="trust-icon-item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span>Secure Checkout</span>
            </div>
            <div className="trust-icon-item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
              <span>Free Shipping ₹799+</span>
            </div>
            <div className="trust-icon-item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <span>COD Available</span>
            </div>
            <div className="trust-icon-item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 4v5h5" /></svg>
              <span>7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PdpHero;
