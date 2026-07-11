import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpHero.css';

/* Refined line icons (replace emoji for a premium, consistent look) */
const Icon = {
  leaf: (
    <svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 15-9 0 8-3 15-9 15z" /><path d="M4 21c1.5-5 5-8 9-9" /></svg>
  ),
  hand: (
    <svg viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24"><path d="M14 17V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v13" /><path d="M14 8h4l3 3v6h-7" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  rupee: (
    <svg viewBox="0 0 24 24"><path d="M6 3h12M6 8h12M15.5 3c0 4-3 5-6 5H6l7 8" /></svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 4v5h5" /></svg>
  ),
};

const Benefits = [
  { icon: Icon.leaf, title: '100% Natural', sub: 'No preservatives' },
  { icon: Icon.shield, title: 'Moisture-Locked', sub: 'Humidity-controlled, dry-sealed' },
  { icon: Icon.sun, title: 'Sun-Cured', sub: 'Authentic taste' },
  { icon: Icon.truck, title: 'Fast Dispatch', sub: 'Ships in 24 hrs' },
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
      setDeliveryMsg(`Get it by ${minDateStr} – ${maxDateStr}`);
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

  // Honest ratings: only render when real reviews exist
  const hasRating = product.reviewsCount > 0 && product.rating > 0;

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

          {hasRating && (
            <div className="pdp-rating-row">
              <div className="pdp-stars" aria-hidden="true">★★★★★</div>
              <span className="pdp-rating-score">{product.rating}</span>
              <button className="pdp-review-link" onClick={() => document.getElementById('pdp-reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                {product.reviewsCount.toLocaleString('en-IN')} verified review{product.reviewsCount !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          <p className="pdp-story">
            {product.short_description ||
              'Prepared using sun-ripened ingredients, cold-pressed mustard oil, and traditional Bihari spices. Every jar is handcrafted in small batches to preserve authentic taste.'}
          </p>

          {/* Benefit chips */}
          <div className="pdp-benefits">
            {Benefits.map((b) => (
              <div className="pdp-benefit" key={b.title}>
                <span className="pdp-benefit-icon pdp-icon" aria-hidden="true">{b.icon}</span>
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
          <p className="pdp-price-note">Inclusive of all taxes</p>

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
                    ✓ Added to Cart
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
                inputMode="numeric"
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
              <span className="pdp-icon" aria-hidden="true">{Icon.shield}</span>
              <span>Secure Checkout</span>
            </div>
            <div className="trust-icon-item">
              <span className="pdp-icon" aria-hidden="true">{Icon.truck}</span>
              <span>Free Shipping ₹799+</span>
            </div>
            <div className="trust-icon-item">
              <span className="pdp-icon" aria-hidden="true">{Icon.rupee}</span>
              <span>COD Available</span>
            </div>
            <div className="trust-icon-item">
              <span className="pdp-icon" aria-hidden="true">{Icon.refresh}</span>
              <span>7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PdpHero;
