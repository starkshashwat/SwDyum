import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ShopPage.css';
import { fetchProducts } from './data/products';

/* ─── Category tab icons ─────────────────────────────────────────────────── */
const tabIcons = {
  all: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  ),
  bestseller: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
  ),
  pickles: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8l2 6H6l2-6z" /><rect x="6" y="8" width="12" height="12" rx="2" /><line x1="12" y1="8" x2="12" y2="20" /></svg>
  ),
  combos: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
  ),
};

const baseTabs = [
  { key: 'All', label: 'All Products', icon: tabIcons.all },
  { key: 'Bestseller', label: 'Bestseller', icon: tabIcons.bestseller }
];

const sortOptions = [
  { key: 'default', label: 'Recommended' },
  { key: 'price-low', label: 'Price: Low → High' },
  { key: 'price-high', label: 'Price: High → Low' },
  { key: 'rating', label: 'Top Rated' },
];

/* ─── Stars helper ───────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="sp-stars-row">
      <div className="sp-stars">
        {[...Array(5)].map((_, idx) => (
          <svg key={idx} width="13" height="13" viewBox="0 0 24 24"
            fill={idx < full ? 'var(--color-accent)' : (idx === full && hasHalf ? 'url(#sp-half)' : 'none')}
            stroke="var(--color-accent)" strokeWidth="1.5" aria-hidden="true">
            {idx === full && hasHalf && (
              <defs><linearGradient id="sp-half"><stop offset="50%" stopColor="var(--color-accent)" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs>
            )}
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="sp-review-count">{count} reviews</span>
    </div>
  );
}

/* ─── Card animation variants ────────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════════ */

function ShopPage({ onNavigate, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeights, setSelectedWeights] = useState({});

  const [dynamicCategories, setDynamicCategories] = useState(baseTabs);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);

      const uniqueCats = Array.from(new Set(data.map(p => p.category))).filter(c => c && c !== 'Uncategorized');
      const newTabs = [...baseTabs];

      uniqueCats.forEach(cat => {
        let icon = tabIcons.pickles;
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes('box') || lowerCat.includes('combo')) {
          icon = tabIcons.combos;
        } else if (lowerCat.includes('murabba') || lowerCat.includes('sweet')) {
          icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3v9" /></svg>;
        }

        newTabs.push({ key: cat, label: cat, icon: icon });
      });

      setDynamicCategories(newTabs);
      setLoading(false);
    };
    load();
  }, []);

  /* ─── Weight selector ─── */
  const handleWeightSelect = (productId, weight) => {
    setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
  };

  const getActiveWeight = (product) => {
    if (!product.prices) return '250g';
    return selectedWeights[product.id] || Object.keys(product.prices)[0] || '250g';
  };

  /* ─── Filter + Sort ─── */
  const filtered = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    let matchesCategory = true;
    if (filter === 'Bestseller') {
      matchesCategory = p.isBestseller;
    } else if (filter !== 'All') {
      matchesCategory = p.category === filter;
    }
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aP = a.base_price || 0, bP = b.base_price || 0;
    if (sortBy === 'price-low') return aP - bP;
    if (sortBy === 'price-high') return bP - aP;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const getDiscount = (mrp, price) => {
    if (!mrp || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <div className="sp-wrapper">

      {/* ════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════ */}
      <section className="sp-hero">
        <div className="sp-hero-banner">
          <div className="sp-hero-bg" style={{ backgroundImage: 'url(/banner.webp)' }} />
          <div className="sp-hero-overlay" />
          <motion.div
            className="sp-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="sp-hero-title">Our <em>Collection</em></h1>
            <p className="sp-hero-subtitle">
              Crafted with traditional recipes, premium ingredients, and generations of Bihari culinary heritage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FILTERS + SORT BAR
      ════════════════════════════════════════════ */}
      <section className="sp-toolbar">
        <div className="sp-toolbar-inner">
          {/* Category tabs */}
          <div className="sp-tabs">
            {dynamicCategories.map(cat => (
              <button
                key={cat.key}
                className={`sp-tab ${filter === cat.key ? 'active' : ''}`}
                onClick={() => setFilter(cat.key)}
              >
                <span className="sp-tab-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right: Search + Sort */}
          <div className="sp-toolbar-right">
            <div className="sp-search-wrap">
              <svg className="sp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                className="sp-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="sp-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {sortOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PRODUCT GRID
      ════════════════════════════════════════════ */}
      <section className="sp-grid-section">
        <div className="sp-grid-container">
          {/* Results count */}
          <p className="sp-result-count">
            Showing <strong>{sorted.length}</strong> product{sorted.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="sp-grid">
              {[...Array(4)].map((_, i) => (
                <div className="sp-card sp-card-skeleton" key={i}>
                  <div className="sp-skel-img" />
                  <div className="sp-skel-info">
                    <div className="sp-skel-line w60" />
                    <div className="sp-skel-line w80" />
                    <div className="sp-skel-line w40" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="sp-empty">
              <p>No products match your filters.</p>
              <button className="sp-reset-btn" onClick={() => { setFilter('All'); setSearchQuery(''); setSortBy('default'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="sp-grid">
              <AnimatePresence mode="popLayout">
                {sorted.map((product, i) => {
                  const activeWeight = getActiveWeight(product);
                  const price = product.prices?.[activeWeight] || product.base_price || 0;
                  const mrp = Math.round(price * 1.35);
                  const discount = getDiscount(mrp, price);

                  return (
                    <motion.div
                      className="sp-card"
                      key={product.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                      onClick={() => onNavigate && onNavigate(`product-${product.slug}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') onNavigate && onNavigate(`product-${product.slug}`); }}
                    >
                      {/* Sale badge removed */}

                      {/* Bestseller badge */}
                      {product.isBestseller && <span className="sp-best-badge">★ Bestseller</span>}

                      {/* Image */}
                      <div className="sp-card-img-wrap">
                        <img src={product.image} alt={product.name} className="sp-card-img" loading="lazy" />
                        <span className="sp-weight-tag">{activeWeight}</span>
                      </div>

                      {/* Info */}
                      <div className="sp-card-body">
                        <Stars rating={product.rating || 4.8} count={product.reviewsCount || 42} />

                        <h3 className="sp-product-name">{product.name}</h3>

                        {product.description && (
                          <p className="sp-product-desc">{product.description}</p>
                        )}

                        {/* Weight selector */}
                        {product.prices && Object.keys(product.prices).length > 1 && (
                          <div className="sp-weight-options">
                            {Object.keys(product.prices).map(w => (
                              <button
                                key={w}
                                className={`sp-weight-btn ${activeWeight === w ? 'active' : ''}`}
                                onClick={e => { e.stopPropagation(); handleWeightSelect(product.id, w); }}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Price row */}
                        <div className="sp-price-row">
                          <span className="sp-mrp">₹{mrp.toLocaleString('en-IN')}</span>
                          <span className="sp-price">₹{price.toLocaleString('en-IN')}/-</span>
                          {discount && <span className="sp-discount">-{discount}% OFF</span>}
                        </div>

                        {/* Add to cart */}
                        <button
                          className="sp-add-btn"
                          onClick={e => { e.stopPropagation(); addToCart && addToCart(product, activeWeight, 1); }}
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOTTOM CTA BANNER
      ════════════════════════════════════════════ */}
      <section className="sp-bottom-cta">
        <div className="sp-bottom-cta-inner">
          <div className="sp-bottom-cta-card">
            <div className="sp-bottom-cta-img-side">
              <img src="/deal_scatter.webp" alt="Swadyum pickles" className="sp-bottom-cta-img" />
            </div>
            <div className="sp-bottom-cta-content">
              <span className="sp-bottom-cta-eyebrow">Featured Collection</span>
              <h2 className="sp-bottom-cta-heading">Experience Bihar In One Box</h2>
              <p className="sp-bottom-cta-desc">
                Elevate your meals with Swadyum's premium hand-packed combo gift chests — a perfect assortment of our finest pickles.
              </p>
              <button className="sp-bottom-cta-btn" onClick={() => {
                const boxCat = dynamicCategories.find(c => c.label.toLowerCase().includes('box') || c.label.toLowerCase().includes('combo'));
                if (boxCat) setFilter(boxCat.key);
                else setFilter('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                Explore Gift Packs
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default ShopPage;
