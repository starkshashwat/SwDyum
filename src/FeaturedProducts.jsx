import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from './data/products';
import './FeaturedProducts.css';

/* ─── Category tab icons (inline SVGs) ───────────────────────────────────── */
const tabIcons = {
  bestseller: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  pickles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2h8l2 6H6l2-6z"/><rect x="6" y="8" width="12" height="12" rx="2"/><line x1="12" y1="8" x2="12" y2="20"/>
    </svg>
  ),
  spices: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.8 11-10 11z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  all: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
};

const baseTabs = [
  { key: 'bestseller', label: 'Bestseller', icon: tabIcons.bestseller }
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/* ─── Star rating component ──────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="fp-stars-row">
      <div className="fp-stars">
        {[...Array(5)].map((_, idx) => (
          <svg
            key={idx}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={idx < full ? '#d4a843' : (idx === full && hasHalf ? 'url(#half-star)' : 'none')}
            stroke="#d4a843"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {idx === full && hasHalf && (
              <defs>
                <linearGradient id="half-star">
                  <stop offset="50%" stopColor="#d4a843" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="fp-review-count">{count} reviews</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function FeaturedProducts({ onNavigate, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bestseller');
  const [dynamicCategories, setDynamicCategories] = useState(baseTabs);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProducts();
      setProducts(data);
      
      const uniqueCats = Array.from(new Set(data.map(p => p.category))).filter(c => c && c !== 'Uncategorized');
      
      const newTabs = [...baseTabs];
      
      uniqueCats.forEach(cat => {
        let icon = tabIcons.pickles;
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes('spices') || lowerCat.includes('powder')) {
          icon = tabIcons.spices;
        } else if (lowerCat.includes('box') || lowerCat.includes('combo')) {
          icon = tabIcons.spices; // fallback icon
        } else if (lowerCat.includes('murabba') || lowerCat.includes('sweet')) {
           icon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v9"/></svg>;
        }
        newTabs.push({ key: cat, label: cat, icon: icon });
      });
      
      newTabs.push({ key: 'all', label: 'All Products', icon: tabIcons.all });
      setDynamicCategories(newTabs);
      setLoading(false);
    };
    loadData();
  }, []);

  /* Filter products by category tab */
  const filtered = (() => {
    if (activeTab === 'bestseller') return products.filter(p => p.isBestseller);
    if (activeTab === 'all') return products;
    return products.filter(p =>
      p.category && p.category.toLowerCase().includes(activeTab.toLowerCase())
    );
  })();

  // Show up to 4 products
  const displayProducts = filtered.slice(0, 4);

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    if (addToCart) {
      const firstWeight = product.prices ? Object.keys(product.prices)[0] : '250g';
      addToCart(product, firstWeight, 1);
    }
  };

  // Compute discount percentage
  const getDiscount = (mrp, price) => {
    if (!mrp || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <section className="fp-section" id="featured-products">
      <div className="fp-container">
        {/* ─── Header ─── */}
        <div className="fp-header">
          <h2 className="fp-title">Featured Products</h2>
          <p className="fp-subtitle">Shop By Categories</p>
        </div>

        {/* ─── Category Tabs ─── */}
        <div className="fp-tabs">
          {dynamicCategories.map((cat) => (
            <button
              key={cat.key}
              className={`fp-tab ${activeTab === cat.key ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.key)}
            >
              <span className="fp-tab-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ─── Product Grid ─── */}
        <div className="fp-grid">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div className="fp-card fp-card-skeleton" key={`skel-${i}`}>
                  <div className="fp-card-img-skeleton" />
                  <div className="fp-card-info-skeleton">
                    <div className="skel-line skel-w60" />
                    <div className="skel-line skel-w80" />
                    <div className="skel-line skel-w40" />
                  </div>
                </div>
              ))
            ) : displayProducts.length === 0 ? (
              <motion.p
                className="fp-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No products found in this category.
              </motion.p>
            ) : (
              displayProducts.map((product, i) => {
                const price = product.base_price || (product.prices ? Object.values(product.prices)[0] : 0);
                const mrp = Math.round(price * 1.35); // Simulated MRP (35% above sale price)
                const discount = getDiscount(mrp, price);
                const firstWeight = product.prices ? Object.keys(product.prices)[0] : '250g';

                return (
                  <motion.div
                    className="fp-card"
                    key={`${activeTab}-${product.id}`}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => onNavigate && onNavigate(`product-${product.slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate(`product-${product.slug}`); }}
                    aria-label={`View ${product.name}`}
                  >
                    {/* Sale Badge removed */}

                    {/* Product Image */}
                    <div className="fp-card-img-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="fp-card-img"
                        loading="lazy"
                      />
                      {/* Weight badge */}
                      <span className="fp-weight-badge">{firstWeight}</span>
                    </div>

                    {/* Product Info */}
                    <div className="fp-card-info">
                      <Stars rating={product.rating || 4.8} count={product.reviewsCount || 42} />

                      <h3 className="fp-product-name">{product.name}</h3>

                      <div className="fp-price-row">
                        <span className="fp-mrp">₹{mrp.toLocaleString('en-IN')}</span>
                        <span className="fp-sale-price">₹{price.toLocaleString('en-IN')}/-</span>
                        {discount && (
                          <span className="fp-discount-badge">-{discount}% OFF</span>
                        )}
                      </div>

                      <button
                        className="fp-add-to-cart-btn"
                        onClick={(e) => handleQuickAdd(e, product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* ─── View More ─── */}
        <div className="fp-view-more-wrap">
          <button
            className="fp-view-more-btn"
            onClick={() => onNavigate && onNavigate('shop')}
          >
            View More
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
