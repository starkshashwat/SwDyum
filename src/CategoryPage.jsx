import React from 'react';
import './CategoryPage.css';

// Reuse product metadata for category lists
const productsData = [
  {
    slug: "mango-pickle",
    name: "Swadyum Mango Pickle",
    tagline: "Tangy, Sun-dried Raw Mango Delight",
    price: 289,
    size: "250g",
    image: "/prod_mango.png",
    rating: 4.9,
    categories: ["mango", "all"]
  },
  {
    slug: "garlic-pickle",
    name: "Swadyum Garlic Pickle",
    tagline: "Pungent & Robust Artisanal Garlic",
    price: 299,
    size: "250g",
    image: "/prod_garlic.png",
    rating: 4.8,
    categories: ["garlic", "all"]
  },
  {
    slug: "lemon-pickle",
    name: "Swadyum Lemon Pickle",
    tagline: "Oil-Free Sweet & Sour Zesty Lemon",
    price: 279,
    size: "250g",
    image: "/prod_lemon.png",
    rating: 4.7,
    categories: ["lemon", "all"]
  },
  {
    slug: "green-chilli",
    name: "Swadyum Stuffed Green Chilli",
    tagline: "Fiery Stuffed Chili Pickle",
    price: 289,
    size: "250g",
    image: "/prod_chili.png",
    rating: 4.9,
    categories: ["chilli", "all"]
  },
  {
    slug: "mixed-pickle",
    name: "Swadyum Assorted Mixed Pickle",
    tagline: "The Harmony of Bihar's Harvest",
    price: 299,
    size: "250g",
    image: "/cat_mixed.png",
    rating: 4.8,
    categories: ["mixed", "all"]
  },
  {
    slug: "combo-box",
    name: "Bestseller Bihar Special Combo Box",
    tagline: "Four Signature Flavors in One Box",
    price: 899,
    size: "4x250g",
    image: "/deal_scatter.png",
    rating: 5.0,
    categories: ["mango", "garlic", "lemon", "chilli", "all"]
  },
  {
    slug: "festive-box",
    name: "Festive Heritage Assortment Box",
    tagline: "A Grand Premium Gifting Chest",
    price: 999,
    size: "Set",
    image: "/about_us.png",
    rating: 4.9,
    categories: ["mango", "garlic", "all"]
  }
];

// Category info details
const categoriesData = {
  "pickles": {
    tag: "all",
    title: "Signature Bihari Pickles Collection",
    subtitle: "~ From Earthen Jars ~",
    story: "Explore our collection of traditional, sun-matured pickles made with cold-pressed mustard oil, local organic spices, and generational culinary techniques. Every recipe is rooted in regional culinary traditions.",
    heroImage: "/banner.png"
  },
  "mango-pickle": {
    tag: "mango",
    title: "Handcrafted Mango Pickles",
    subtitle: "~ Mithila Sun-Dried Summer Heritage ~",
    story: "Made with firm, green raw mangoes hand-sliced and sun-cured over weeks. Infused with coarse mustard seeds, kalonji, fennel, and cold-pressed mustard oil, this tangy delicacy represents the heart of Bihar's summers.",
    heroImage: "/cat_mango.png"
  },
  "garlic-pickle": {
    tag: "garlic",
    title: "Mountain Garlic Pickles",
    subtitle: "~ Rich Winter Indulgence ~",
    story: "Carefully hand-peeled plump cloves of regional garlic cured in stone-ground spices and pure mustard oil. Its rich, warm flavor balances parathas, khichdi, and heavy winter meals.",
    heroImage: "/cat_garlic.png"
  },
  "lemon-pickle": {
    tag: "lemon",
    title: "Oil-Free Zesty Lemon Pickles",
    subtitle: "~ Aged Solar Softened Citrus ~",
    story: "Prepared entirely without oil, matured in glass jars under direct sunlight for forty days. Natural juices combine with carom seeds and rock salt to form a sweet, sour glaze that aids digestion.",
    heroImage: "/prod_lemon.png"
  },
  "green-chilli-pickle": {
    tag: "chilli",
    title: "Stuffed Green Chilli Pickles",
    subtitle: "~ Bold Spicy Heat ~",
    story: "Bold local green chillies, slit and stuffed with roasted spices, dry mango powder, and pure oil. Handcrafted in small batches for the ultimate spicy comfort.",
    heroImage: "/prod_chili.png"
  }
};

// Recipe pairings by category
const pairingsData = {
  "mango": [
    { title: "Sattu Paratha & Dahi", desc: "The tangy raw mango slices break down the roasted gram flour warmth perfectly." },
    { title: "Arhar Dal & Steamed Rice", desc: "A classic Bihari lunch complete with a dollop of pure ghee and mango achar." }
  ],
  "garlic": [
    { title: "Garhwal Khichdi", desc: "The bold garlic notes bring savory complexity to simple lentil and rice porridge." },
    { title: "Litti Chokha", desc: "Dip your wood-fired sattu Littis in ghee, paired with spicy garlic cloves." }
  ],
  "lemon": [
    { title: "Puri & Aloo Dum", desc: "Sweet-and-sour oil-free lemon glaze cuts through the heavy spiced potato curry." },
    { title: "Curd Rice", desc: "A cooling comfort meal topped with a piece of citrus peel." }
  ],
  "chilli": [
    { title: "Masala Poori", desc: "Deep fried pooris paired with fiery stuffed chillies for a spicy morning kick." },
    { title: "Plain Paratha", desc: "Roll a paratha with mustard oil masala stuffing for an instant high-flavor travel snack." }
  ],
  "default": [
    { title: "Sattu Paratha", desc: "The authentic Bihari flatbread paired with any of our house pickles." },
    { title: "Dal Chawal", desc: "Elevate your basic comfort food with a spoonful of artisanal achar." }
  ]
};

// Customer reviews sample
const customerReviewsData = [
  { name: "Siddharth Raj", rating: 5, text: "The taste is completely home-style. I haven't had such good raw mango pickle since I left Patna." },
  { name: "Ananya Mishra", rating: 5, text: "Oil-free lemon pickle is a masterpiece. It's digestively soothing and incredibly sweet and sour!" },
  { name: "Rajesh Ranjan", rating: 5, text: "Bold garlic pickle with pure mustard oil flavor. Highly recommended with warm parathas." }
];

function CategoryPage({ categorySlug, onNavigate }) {
  const cat = categoriesData[categorySlug] || categoriesData["pickles"];
  const tag = cat.tag;

  // Filter products matching active category
  const filteredProducts = productsData.filter(p => p.categories.includes(tag));

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
            {filteredProducts.map((p) => (
              <div key={p.slug} className="cat-product-card" onClick={() => onNavigate('product-' + p.slug)}>
                <div className="cat-prod-img-box">
                  <img src={p.image} alt={p.name} className="cat-prod-img" />
                </div>
                <div className="cat-prod-info">
                  <div className="cat-prod-rating">{"★".repeat(Math.floor(p.rating))} <span className="rating-num">({p.rating})</span></div>
                  <h3 className="cat-prod-name">{p.name}</h3>
                  <p className="cat-prod-tagline">{p.tagline}</p>
                  <div className="cat-prod-footer">
                    <span className="cat-prod-price">₹{p.price} <small>/ {p.size}</small></span>
                    <button className="cat-prod-btn" onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('product-' + p.slug);
                    }}>View Details</button>
                  </div>
                </div>
              </div>
            ))}
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
