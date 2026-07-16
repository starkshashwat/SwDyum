import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from './data/products';
import './FeaturedProducts.css';

/* ─── Category tab icons (inline SVGs) ───────────────────────────────────── */
const tabIcons = {
  bestseller: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  pickles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2h8l2 6H6l2-6z" /><rect x="6" y="8" width="12" height="12" rx="2" /><line x1="12" y1="8" x2="12" y2="20" />
    </svg>
  ),
  spices: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.8 11-10 11z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  all: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
};

const baseTabs = [
  { key: 'bestseller', label: 'Bestseller', icon: tabIcons.bestseller }
];

/* ─── Static product metadata for choices ───────────────────────────────── */
const PRODUCT_METADATA = {
  'mango-pickle': {
    tasteDesc: 'Sharp, tangy raw Langda mango pickle, sun-cured in cold-pressed mustard oil, made in small batches in Ara, Bihar.',
    spice: 'Medium',
    servings: '250g · Serves 4–6',
  },
  'garlic-pickle': {
    tasteDesc: 'Earthy mountain garlic cloves in spicy mustard oil.',
    spice: 'Hot',
    servings: '250g · Serves 4–6',
  },
  'lemon-pickle': {
    tasteDesc: 'Oil-free sun-cured citrus with carom seeds.',
    spice: 'Mild',
    servings: '250g · Serves 4–6',
  },
  'mixed-pickle': {
    tasteDesc: 'Traditional farmhouse mix of solar matured vegetables.',
    spice: 'Medium',
    servings: '250g · Serves 4–6',
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
function FeaturedProducts({ onNavigate, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bestseller');
  const [dynamicCategories, setDynamicCategories] = useState(baseTabs);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [expandedDescs, setExpandedDescs] = useState({});
  const [overflowMap, setOverflowMap] = useState({});
  const descRefs = useRef({});

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
  const filtered = useMemo(() => {
    if (activeTab === 'bestseller') return products.filter(p => p.isBestseller);
    if (activeTab === 'all') return products;
    return products.filter(p =>
      p.category && p.category.toLowerCase().includes(activeTab.toLowerCase())
    );
  }, [products, activeTab]);

  const displayProducts = filtered;

  /* Detect which descriptions overflow their 2-line clamp so the
     "Read more" toggle only appears when it's actually needed. */
  useEffect(() => {
    const newOverflowMap = {};
    Object.entries(descRefs.current).forEach(([id, el]) => {
      if (el) {
        newOverflowMap[id] = el.scrollHeight > el.clientHeight + 1;
      }
    });
    setOverflowMap(newOverflowMap);
  }, [displayProducts]);

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    if (addToCart) {
      const firstWeight = product.prices ? Object.keys(product.prices)[0] : '250g';
      const activeSize = selectedWeights[product.id] || firstWeight;
      addToCart(product, activeSize, 1);
    }
  };

  const toggleDescription = (e, productId) => {
    e.stopPropagation();
    setExpandedDescs(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <section className="fp-section" id="featured-products">
      <div className="fp-container">
        {/* ─── Header ─── */}
        <div className="fp-header">
          <h2 className="fp-title">Start With Our Bestsellers</h2>
          <p className="fp-subtitle">Traditional Bihari flavours, packed fresh in small batches.</p>
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
                const firstWeight = product.prices ? Object.keys(product.prices)[0] : '250g';
                const activeSize = selectedWeights[product.id] || firstWeight;
                const price = product.prices ? product.prices[activeSize] : (product.base_price || 0);
                const mrp = Math.round(price * 1.35); // Simulated MRP (35% above sale price)
                const meta = PRODUCT_METADATA[product.slug] || {
                  tasteDesc: product.description || 'Traditional Bihari style matured recipe.',
                  spice: 'Medium',
                  servings: '250g · Serves 4–6'
                };

                // Servings estimate matches active selected weight
                const servingsLabel = activeSize === '500g' ? '500g · Serves 8–12' : activeSize === '1Kg' ? '1Kg · Serves 16–24' : '250g · Serves 4–6';

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
                    {/* 1. Product Image */}
                    <div className="fp-card-img-wrap">
                      <img
                        src={product.image || '/prod_mango.webp'}
                        alt={product.name}
                        className="fp-card-img"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Info container */}
                    <div className="fp-card-info">
                      {/* 2. Bestseller badge, only for genuine bestsellers */}
                      {product.isBestseller && (
                        <span className="fp-bestseller-badge">⭐ Bestseller</span>
                      )}

                      {/* 3. Product Name */}
                      <h3 className="fp-product-name">{product.name}</h3>

                      {/* 4. Synced short description — clamped with Read more/less toggle */}
                      <p
                        className={`fp-taste-desc ${expandedDescs[product.id] ? 'fp-taste-desc--expanded' : ''}`}
                        ref={(el) => { if (el) descRefs.current[product.id] = el; }}
                      >
                        {product.description || meta.tasteDesc}
                      </p>
                      {overflowMap[product.id] && (
                        <button
                          type="button"
                          className="fp-read-more-btn"
                          onClick={(e) => toggleDescription(e, product.id)}
                        >
                          {expandedDescs[product.id] ? 'Read less' : 'Read more'}
                        </button>
                      )}

                      {/* 5. Rating + review count, shown only when real approved reviews exist */}
                      {product.rating > 0 && product.reviewsCount > 0 && (
                        <div className="fp-rating-row">
                          <div className="flex gap-0.5" style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <svg key={s} viewBox="0 0 20 20" fill={s <= Math.round(product.rating) ? '#f59e0b' : '#e5e7eb'} stroke={s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} strokeWidth="1" width="13" height="13">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="rating-val">{product.rating}</span>
                          <span className="reviews-count">({product.reviewsCount.toLocaleString('en-IN')} reviews)</span>
                        </div>
                      )}

                      {/* Weight Selector Button Grid */}
                      {product.prices && Object.keys(product.prices).length > 1 && (
                        <div className="fp-card-size-selector" onClick={(e) => e.stopPropagation()}>
                          {Object.keys(product.prices).map(size => (
                            <button
                              key={size}
                              type="button"
                              className={`fp-card-size-btn ${activeSize === size ? 'active' : ''}`}
                              onClick={() => setSelectedWeights(prev => ({ ...prev, [product.id]: size }))}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 8. Original price, sale price, saving */}
                      <div className="fp-price-row">
                        <span className="fp-mrp">₹{mrp}</span>
                        <span className="fp-sale-price">₹{price}</span>
                        <span className="fp-save-amount">· Save ₹{mrp - price}</span>
                      </div>

                      {/* 9. Add to Cart button */}
                      <button
                        className="fp-add-to-cart-btn"
                        onClick={(e) => handleQuickAdd(e, product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        Add to Cart
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
            className="fp-view-more-btn btn-primary"
            onClick={() => onNavigate && onNavigate('shop')}
          >
            View All Products
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
