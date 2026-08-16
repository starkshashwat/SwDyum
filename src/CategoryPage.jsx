import React, { useState, useEffect } from 'react';
import './CategoryPage.css';

import { getProducts } from './lib/api/catalogService';

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



// Customer reviews sample
const customerReviewsData = [
  { name: "Siddharth Raj", rating: 5, text: "The taste is completely home-style. I haven't had such good raw mango pickle since I left Patna." },
  { name: "Ananya Mishra", rating: 5, text: "Oil-free lemon pickle is a masterpiece. It's digestively soothing and incredibly sweet and sour!" },
  { name: "Rajesh Ranjan", rating: 5, text: "Bold garlic pickle with pure mustard oil flavor. Highly recommended with warm parathas." }
];

function CategoryPage({ categorySlug, onNavigate }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState({
    title: "Handcrafted Pickles & Preserves",
    subtitle: "~ From Earthen Jars ~",
    story: "Explore our collection of traditional, sun-matured pickles made with cold-pressed mustard oil, local organic spices, and generational culinary techniques.",
    heroImage: "/banner.webp"
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getProducts();

      if (!categorySlug || categorySlug === 'pickles' || categorySlug === 'all') {
        setFilteredProducts(data);
        setCategoryInfo({
          title: "Signature Bihari Pickles Collection",
          subtitle: "~ From Earthen Jars ~",
          story: "Explore our collection of traditional, sun-matured pickles made with cold-pressed mustard oil, local organic spices, and generational culinary techniques.",
          heroImage: "/banner.webp"
        });
      } else {
        const matching = data.filter(p => {
          const catName = (p.category || '').toLowerCase();
          const slug = (categorySlug || '').toLowerCase().replace('category-', '');
          return catName.includes(slug) || slug.includes(catName);
        });

        // If specific matching products exist, use them, otherwise show all active catalog items
        setFilteredProducts(matching.length > 0 ? matching : data);

        const cleanTitle = categorySlug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        setCategoryInfo({
          title: `${cleanTitle} Collection`,
          subtitle: "~ Handcrafted Heritage ~",
          story: `Handcrafted in small batches with traditional spices and cold-pressed mustard oil, celebrating authentic flavors.`,
          heroImage: categorySlug.includes('mango') ? '/cat_mango.webp' : '/banner.webp'
        });
      }
      setLoading(false);
    };
    loadData();
  }, [categorySlug]);

  const cat = categoryInfo;



  // Related categories lists
  const relatedCategoriesList = [
    { slug: 'traditional-pickles', name: 'Traditional Pickles' }
  ].filter(c => c.slug !== categorySlug);

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
              )
            })}
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
