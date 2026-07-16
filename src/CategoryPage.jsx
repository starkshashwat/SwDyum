import React, { useState, useEffect } from 'react';
import './CategoryPage.css';

import { fetchProducts } from './data/products';

// Category info details
const categoriesData = {
  "pickles": {
    tag: "Pickle",
    title: "Signature Bihari Pickles Collection",
    subtitle: "~ From Earthen Jars ~",
    story: "Explore our collection of traditional, sun-matured pickles made with cold-pressed mustard oil, local organic spices, and generational culinary techniques. Every recipe is rooted in regional culinary traditions.",
    heroImage: "/banner.webp"
  },
  "mango-pickle": {
    tag: "Mango",
    title: "Handcrafted Mango Pickles",
    subtitle: "~ Mithila Sun-Dried Summer Heritage ~",
    story: "Made with firm, green raw mangoes hand-sliced and sun-cured over weeks. Infused with coarse mustard seeds, kalonji, fennel, and cold-pressed mustard oil, this tangy delicacy represents the heart of Bihar's summers.",
    heroImage: "/cat_mango.webp"
  }
};

// Recipe pairings by category
const pairingsData = {
  "Mango": [
    { title: "Sattu Paratha & Dahi", desc: "The tangy raw mango slices break down the roasted gram flour warmth perfectly." },
    { title: "Arhar Dal & Steamed Rice", desc: "A classic Bihari lunch complete with a dollop of pure ghee and mango achar." }
  ],
  "default": [
    { title: "Sattu Paratha & Dahi", desc: "The tangy raw mango slices break down the roasted gram flour warmth perfectly." },
    { title: "Arhar Dal & Steamed Rice", desc: "A classic Bihari lunch complete with a dollop of pure ghee and mango achar." }
  ]
};

// Customer reviews sample
const customerReviewsData = [
  { name: "Siddharth Raj", rating: 5, text: "The taste is completely home-style. I haven't had such good raw mango pickle since I left Patna." },
  { name: "Ananya Mishra", rating: 5, text: "Oil-free lemon pickle is a masterpiece. It's digestively soothing and incredibly sweet and sour!" },
  { name: "Rajesh Ranjan", rating: 5, text: "Bold garlic pickle with pure mustard oil flavor. Highly recommended with warm parathas." }
];

function CategoryPage({ categorySlug, onNavigate }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cat = categoriesData[categorySlug] || categoriesData["pickles"];
  const tag = cat.tag;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchProducts();
      // Filter products matching active category tag
      const filtered = data.filter(p => p.category.includes(tag) || (p.categories && p.categories.includes(tag)) || p.name.includes(tag));
      setFilteredProducts(filtered);
      setLoading(false);
    };
    loadData();
  }, [tag]);

  // Get recipe pairings
  const pairings = pairingsData[tag] || pairingsData["default"];

  // Related categories lists
  const relatedCategoriesList = Object.keys(categoriesData)
    .filter(slug => slug !== categorySlug)
    .map(slug => ({
      slug,
      name: categoriesData[slug].title.replace(" Pickles", "")
    }));

  return (
    <div className="category-page-wrapper">
      
      {/* 1. HERO BANNER */}
      <section className="category-hero-section" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.65)), url(${cat.heroImage})` }}>
        <div className="category-hero-container">
          <span className="category-hero-subtitle">{cat.subtitle}</span>
          <h1 className="category-hero-title">{cat.title}</h1>
          <div className="category-hero-line"></div>
        </div>
      </section>

      {/* 2. CATEGORY STORY */}
      <section className="category-story-section">
        <div className="category-story-container">
          <div className="category-story-card">
            <span className="section-subtitle">~ Sourced & Crafted ~</span>
            <h2 className="section-headline">The Story Behind the Flavor</h2>
            <p className="category-story-narrative">{cat.story}</p>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT GRID */}
      <section className="category-products-section">
        <div className="category-products-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ Fresh Batches ~</span>
            <h2 className="section-headline">Available Handcrafted Jars</h2>
          </div>

          <div className="category-products-grid">
            {filteredProducts.map((p) => {
              const size = Object.keys(p.prices)[0];
              const price = p.prices[size];
              return (
              <div key={p.slug} className="cat-product-card" onClick={() => onNavigate('product-' + p.slug)}>
                <div className="cat-prod-img-box">
                  <img src={p.image} alt={p.name} className="cat-prod-img" />
                </div>
                <div className="cat-prod-info">
                  <div className="cat-prod-rating">{"★".repeat(Math.floor(p.rating))} <span className="rating-num">({p.rating})</span></div>
                  <h3 className="cat-prod-name">{p.name}</h3>
                  <p className="cat-prod-tagline">{p.description.substring(0, 40)}...</p>
                  <div className="cat-prod-footer">
                    <span className="cat-prod-price">₹{price} <small>/ {size}</small></span>
                    <button className="cat-prod-btn" onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('product-' + p.slug);
                    }}>View Details</button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* 4. BENEFITS */}
      <section className="category-benefits-section">
        <div className="category-benefits-container">
          <div className="benefits-card-row">
            <div className="benefit-card">
              <span className="benefit-icon">🏺</span>
              <h3>Clay Jars Aged</h3>
              <p>Aged traditionally under sun heat inside local clay vessels.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🌱</span>
              <h3>No Preservatives</h3>
              <p>100% natural, zero chemicals, vinegar, or artificial stabilizers.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🌾</span>
              <h3>Cold-Pressed Oil</h3>
              <p>Prepared only with raw cold-pressed mustard oil from local mills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECIPE PAIRINGS */}
      <section className="category-pairings-section">
        <div className="category-pairings-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ Perfect Pairings ~</span>
            <h2 className="section-headline">How To Enjoy It Best</h2>
          </div>

          <div className="pairings-grid">
            {pairings.map((pair, idx) => (
              <div key={idx} className="pairing-card">
                <div className="pairing-number">0{idx + 1}</div>
                <div className="pairing-content">
                  <h3>{pair.title}</h3>
                  <p>{pair.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. RELATED CATEGORIES */}
      <section className="category-related-section">
        <div className="category-related-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ Culinary Map ~</span>
            <h2 className="section-headline">Explore Other Categories</h2>
          </div>

          <div className="related-cats-row">
            {relatedCategoriesList.map((rel) => (
              <button key={rel.slug} className="rel-cat-btn" onClick={() => onNavigate('category-' + rel.slug)}>
                {rel.name} Pickles <span>➔</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="category-reviews-section">
        <div className="category-reviews-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ Verified Love ~</span>
            <h2 className="section-headline">Reviews from Indian Kitchens</h2>
          </div>

          <div className="reviews-feed-row">
            {customerReviewsData.map((rev, idx) => (
              <div key={idx} className="review-feed-card">
                <div className="rf-meta">
                  <span className="rf-user">{rev.name}</span>
                  <span className="rf-stars">★★★★★</span>
                </div>
                <p className="rf-message">"{rev.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default CategoryPage;
