import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './ShopPage.css';

// Products Listing Data
const productsData = [
  {
    id: 1,
    name: "Swadyum Mango Pickle",
    slug: "mango-pickle",
    category: "Traditional Achar",
    filterTag: "Mango",
    description: "Deeply tangy, raw green mangoes cured slowly under the Bihar sun with handmade ground mustard and red chili blends.",
    image: "/prod_mango.png",
    prices: { "250g": 289, "500g": 489, "1kg": 799 },
    rating: 4.9,
    reviewsCount: 148,
    isBestseller: true
  },
  {
    id: 2,
    name: "Swadyum Garlic Pickle",
    slug: "garlic-pickle",
    category: "Traditional Achar",
    filterTag: "Garlic",
    description: "Whole plump garlic bulbs matured in cold-pressed mustard oil with generational spice mixtures for a bold, pungent flavor.",
    image: "/prod_garlic.png",
    prices: { "250g": 299, "500g": 499, "1kg": 819 },
    rating: 4.8,
    reviewsCount: 96,
    isBestseller: true
  },
  {
    id: 3,
    name: "Swadyum Lemon Pickle",
    slug: "lemon-pickle",
    category: "Traditional Achar",
    filterTag: "Lemon",
    description: "Refreshing sweet-and-sour lemon chunks cured natural-style without oil. Brings a zesty comfort to light meals.",
    image: "/prod_lemon.png",
    prices: { "250g": 279, "500g": 479, "1kg": 789 },
    rating: 4.7,
    reviewsCount: 64,
    isBestseller: false
  },
  {
    id: 4,
    name: "Swadyum Stuffed Green Chilli",
    slug: "green-chilli",
    category: "Traditional Achar",
    filterTag: "Green Chilli",
    description: "Thick green chilies slit lengthwise and stuffed with amchur, mustard powder, and local spices. For authentic spice lovers.",
    image: "/prod_chili.png",
    prices: { "250g": 289, "500g": 489, "1kg": 799 },
    rating: 4.9,
    reviewsCount: 112,
    isBestseller: false
  },
  {
    id: 5,
    name: "Swadyum Assorted Mixed Pickle",
    slug: "mixed-pickle",
    category: "Traditional Achar",
    filterTag: "Mixed",
    description: "A colorful garden assortment of mangoes, carrots, lemons, and garlic cloves cured together for a complex, layered tang.",
    image: "/cat_mixed.png",
    prices: { "250g": 299, "500g": 499, "1kg": 819 },
    rating: 4.8,
    reviewsCount: 88,
    isBestseller: true
  },
  {
    id: 6,
    name: "Bestseller Bihar Special Combo Box",
    slug: "combo-box",
    category: "Heritage Gift Box",
    filterTag: "Gift Boxes",
    description: "A beautifully curated rigid collection box containing four 250g jars of our most loved traditional Bihari pickles.",
    image: "/deal_scatter.png",
    prices: { "4x250g": 899 },
    rating: 5.0,
    reviewsCount: 220,
    isBestseller: true
  },
  {
    id: 7,
    name: "Festive Heritage Assortment Box",
    slug: "festive-box",
    category: "Heritage Gift Box",
    filterTag: "Gift Boxes",
    description: "A premium wooden gift chest featuring two signature pickles, organic sattu flour, and stone-ground spices.",
    image: "/about_us.png",
    prices: { "Set": 999 },
    rating: 4.9,
    reviewsCount: 45,
    isBestseller: false
  }
];

function ShopPage({ onNavigate, addToCart }) {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState(1000);
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const [onlyGiftBoxes, setOnlyGiftBoxes] = useState(false);
  const [selectedWeights, setSelectedWeights] = useState({});
  
  const carouselRef = useRef(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  // Initialize carousel scroll width constraints
  useEffect(() => {
    if (carouselRef.current) {
      setCarouselWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [filter, searchQuery, sortBy]);

  const handleWeightSelect = (productId, weight) => {
    setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
  };

  const getActiveWeight = (product) => {
    return selectedWeights[product.id] || Object.keys(product.prices)[0];
  };

  // Filter & Search Logic
  const filteredProducts = productsData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category pill matching
    let matchesCategory = true;
    if (filter !== 'All') {
      if (filter === 'Gift Boxes') {
        matchesCategory = p.category === 'Heritage Gift Box';
      } else {
        matchesCategory = p.filterTag === filter;
      }
    }

    // Toggle parameters
    const matchesBestseller = !onlyBestsellers || p.isBestseller;
    const matchesGiftBoxes = !onlyGiftBoxes || p.category === 'Heritage Gift Box';

    // Price matching
    const activeWeight = getActiveWeight(p);
    const price = p.prices[activeWeight];
    const matchesPrice = price <= priceRange;

    return matchesSearch && matchesCategory && matchesBestseller && matchesGiftBoxes && matchesPrice;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aWeight = getActiveWeight(a);
    const bWeight = getActiveWeight(b);
    const aPrice = a.prices[aWeight];
    const bPrice = b.prices[bWeight];

    if (sortBy === 'price-low') {
      return aPrice - bPrice;
    } else if (sortBy === 'price-high') {
      return bPrice - aPrice;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0; // Default ordering
  });

  return (
    <div className="shop-page-wrapper">
      
      {/* SECTION 01: HERO SECTION */}
      <section className="shop-hero-section">
        <div className="shop-hero-container">
          
          {/* Left: Editorial Texts */}
          <div className="shop-hero-content">
            <span className="section-subtitle">~ Shop Swadyum ~</span>
            <h1 className="shop-hero-headline section-headline">
              Discover Bihar's<br />
              Finest Homemade Pickles
            </h1>
            <p className="shop-hero-description">
              Crafted using traditional recipes, premium ingredients, and generations of culinary heritage.
            </p>
          </div>

          {/* Right: Large Editorial Food Composition */}
          <div className="shop-hero-visual-collage">
            <div className="collage-brass-rim"></div>
            <div className="collage-visual-wrapper">
              <img src="/deal_scatter.png" alt="Spices and ingredients" className="collage-img-back" />
              <img src="/prod_mango.png" alt="Mango Pickle jar" className="collage-img-front-left" />
              <img src="/prod_garlic.png" alt="Garlic Achar jar" className="collage-img-front-right" />
            </div>
            <div className="collage-utensil-tag">Traditional Brassware</div>
          </div>

        </div>
      </section>

      {/* SECTION 02: SEARCH & DISCOVERY BAR */}
      <section className="shop-filter-bar-section">
        <div className="shop-filter-bar-container">
          
          <div className="filter-row-top">
            {/* Search Input */}
            <div className="filter-search-box">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Search Products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>

            {/* Sort Selector */}
            <div className="filter-sort-box">
              <label className="filter-label">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="sort-select-dropdown"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Price Filter range */}
            <div className="filter-price-box">
              <div className="price-label-row">
                <span className="filter-label">Max Price</span>
                <span className="price-value-tag">₹{priceRange}</span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="1000" 
                step="50"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))} 
                className="price-range-slider"
              />
            </div>
          </div>

          <div className="filter-row-bottom">
            {/* Categories pills */}
            <div className="filter-categories-pills">
              {['All', 'Mango', 'Garlic', 'Lemon', 'Green Chilli', 'Mixed', 'Gift Boxes'].map((pill) => (
                <button
                  key={pill}
                  className={`shop-pill-btn ${filter === pill ? 'active' : ''}`}
                  onClick={() => setFilter(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Feature Toggle Badges */}
            <div className="filter-toggle-badges">
              <label className="toggle-badge-item">
                <input 
                  type="checkbox" 
                  checked={onlyBestsellers} 
                  onChange={(e) => setOnlyBestsellers(e.target.checked)} 
                  className="hidden-checkbox"
                />
                <span className={`toggle-pill-label ${onlyBestsellers ? 'active' : ''}`}>✦ Bestsellers Only</span>
              </label>

              <label className="toggle-badge-item">
                <input 
                  type="checkbox" 
                  checked={onlyGiftBoxes} 
                  onChange={(e) => setOnlyGiftBoxes(e.target.checked)} 
                  className="hidden-checkbox"
                />
                <span className={`toggle-pill-label ${onlyGiftBoxes ? 'active' : ''}`}>🎁 Gift Boxes Only</span>
              </label>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 03: PRODUCT GRID */}
      <section className="shop-product-grid-section">
        <div className="shop-grid-container">
          <div className="grid-meta-row">
            <span className="products-found-label">Showing {sortedProducts.length} artisanal products</span>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="no-products-found">
              <p>No products match your active discovery filters.</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setFilter('All');
                  setSearchQuery('');
                  setSortBy('default');
                  setPriceRange(1000);
                  setOnlyBestsellers(false);
                  setOnlyGiftBoxes(false);
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="shop-products-grid">
              {sortedProducts.map((p) => {
                const activeWeight = getActiveWeight(p);
                const price = p.prices[activeWeight];

                return (
                  <div key={p.id} className="shop-product-card">
                    <div className="card-paper-overlay"></div>
                    <div className="card-gold-border-reveal"></div>
                    
                    {/* Image with zoom on hover */}
                    <div className="product-image-container" style={{ cursor: 'pointer' }} onClick={() => onNavigate('product-' + p.slug)}>
                      <img src={p.image} alt={p.name} className="card-product-img" />
                      {p.isBestseller && <span className="bestseller-badge">Bestseller</span>}
                    </div>

                    <div className="product-card-details">
                      <span className="product-card-category">{p.category}</span>
                      <h3 className="product-card-title" style={{ cursor: 'pointer' }} onClick={() => onNavigate('product-' + p.slug)}>{p.name}</h3>
                      <p className="product-card-desc">{p.description}</p>
                      
                      {/* Ratings */}
                      <div className="product-card-rating">
                        <span className="rating-stars">{"★".repeat(Math.floor(p.rating))}</span>
                        <span className="rating-text">{p.rating} ({p.reviewsCount} reviews)</span>
                      </div>

                      {/* Weight & Price Selector */}
                      <div className="product-price-selector">
                        <div className="weight-options">
                          {Object.keys(p.prices).map((weight) => (
                            <button
                              key={weight}
                              className={`weight-btn ${activeWeight === weight ? 'active' : ''}`}
                              onClick={() => handleWeightSelect(p.id, weight)}
                            >
                              {weight}
                            </button>
                          ))}
                        </div>
                        <div className="price-display">
                          <span className="price-currency">₹</span>
                          <span className="price-amount">{price}</span>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="product-card-actions">
                        <button className="add-to-cart-btn" onClick={() => addToCart(p, activeWeight, 1)}>Add To Cart</button>
                        <button className="quick-view-btn" onClick={() => onNavigate('product-' + p.slug)}>Quick View</button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 04: FEATURED COLLECTION BANNER */}
      <section className="shop-featured-banner-section">
        <div className="featured-banner-wrapper">
          <div className="featured-banner-card">
            
            <div className="banner-visual-box">
              <div className="halo-glow"></div>
              <img src="/deal_scatter.png" alt="Swadyum Gift Box" className="giftbox-banner-img" />
            </div>

            <div className="banner-content-box">
              <span className="section-subtitle">~ Featured Collection ~</span>
              <h2 className="section-headline banner-light-headline">Experience Bihar In One Box</h2>
              <p className="banner-description">
                Elevate your meals and celebrations with Swadyum's premium hand-packed combo gift chests. A perfect assortment of raw mango, whole garlic, sweet lemon, and stuffed red chili pickles inspired by traditional family recipes.
              </p>
              <button className="banner-shop-cta-btn" onClick={() => setFilter('Gift Boxes')}>
                Explore Gifting Packs
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 05: CUSTOMER FAVORITES (CAROUSEL) */}
      <section className="shop-favorites-carousel-section">
        <div className="favorites-container">
          <div className="favorites-header">
            <span className="section-subtitle">~ Customer Favorites ~</span>
            <h2 className="section-headline">Most Ordered Products</h2>
          </div>

          <div className="favorites-slider-wrap">
            <motion.div ref={carouselRef} className="favorites-carousel" whileTap={{ cursor: "grabbing" }}>
              <motion.div 
                drag="x" 
                dragConstraints={{ right: 0, left: -carouselWidth }}
                className="favorites-carousel-track"
              >
                {productsData.slice(0, 5).map((fav) => (
                  <div key={fav.id} className="fav-product-card">
                    <div className="fav-img-wrapper" style={{ cursor: 'pointer' }} onClick={() => onNavigate('product-' + fav.slug)}>
                      <img src={fav.image} alt={fav.name} />
                      <span className="fav-order-badge">Bestseller</span>
                    </div>
                    <div className="fav-info">
                      <h4 className="fav-name" style={{ cursor: 'pointer' }} onClick={() => onNavigate('product-' + fav.slug)}>{fav.name}</h4>
                      <div className="fav-rating">★★★★★ {fav.rating}</div>
                      <p className="fav-text">“Generations of recipes cured under Bihar's sun.”</p>
                      <button className="fav-shop-link-btn" onClick={() => onNavigate('product-' + fav.slug)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 06: CTA */}
      <section className="shop-footer-cta-section">
        <div className="footer-cta-container">
          <div className="footer-cta-card">
            <span className="section-subtitle">~ Explore Traditional Bihar Flavors ~</span>
            <h2 className="section-headline cta-light-headline">Bring Swadyum To Your Dining Table</h2>
            <p className="cta-description">
              Prepared without artificial preservatives, colors, or shortcuts. Naturally sun-cured and shipped with care across India.
            </p>
            <button 
              className="cta-action-btn"
              onClick={() => {
                setFilter('All');
                setSearchQuery('');
                window.scrollTo({ top: 600, behavior: 'smooth' });
              }}
            >
              Shop All Pickles
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default ShopPage;
