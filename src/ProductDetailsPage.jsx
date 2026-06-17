import React, { useState, useEffect } from 'react';
import './ProductDetailsPage.css';

// Rich Product-specific Dataset mapping slugs to their details
const productDetailsData = {
  "mango-pickle": {
    name: "Swadyum Mango Pickle",
    tagline: "Tangy, Sun-dried Raw Mango Delight",
    description: "Authentic homemade mango pickle inspired by traditional Bihar recipes. Crafted from firm raw green mangoes cut into generous slices, cured slowly under the sunlight, and steeped in cold-pressed mustard oil with hand-ground spices.",
    prices: { "250g": 289, "500g": 489, "1kg": 799 },
    rating: 4.9,
    reviewsCount: 148,
    images: ["/prod_mango.png", "/deal_scatter.png", "/gal_mix.png"],
    story: {
      headline: "A Recipe Passed Through Generations",
      narrative: "During the sweltering Bihar summers, the courtyards of our grandmothers' homes bloomed with the aroma of drying mangoes. Sliced by hand using traditional cutters, the mango pieces were seasoned in clay pots and set out on linen sheets to absorb the hot sun. This recipe remains untouched today, preserving that exact generational comfort."
    },
    ingredients: ["Raw Green Mango", "Cold-Pressed Mustard Oil", "Kalonji & Saunf (Fennel)", "Red Chili Powder", "Traditional Spice Blend"],
    nutrition: {
      calories: "145 kcal",
      protein: "1.2g",
      carbohydrates: "8.5g",
      fats: "12.4g",
      servingSize: "15g (1 Tablespoon)"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["garlic-pickle", "mixed-pickle", "combo-box"]
  },
  "garlic-pickle": {
    name: "Swadyum Garlic Pickle",
    tagline: "Pungent & Robust Artisanal Garlic",
    description: "Authentic homemade garlic pickle inspired by traditional Bihar recipes. Plump cloves of mountain garlic cured to absolute tenderness in mustard oil and loaded with natural heat.",
    prices: { "250g": 299, "500g": 499, "1kg": 819 },
    rating: 4.8,
    reviewsCount: 96,
    images: ["/prod_garlic.png", "/deal_scatter.png", "/about_us.png"],
    story: {
      headline: "The Warmth of Bihari Hospitality",
      narrative: "Garlic pickle is a cornerstone of Bihari winter comfort. Harvested from regional farms, the garlic bulbs are carefully hand-peeled, cured, and combined with stone-ground mustard seeds. This savory companion brings robust flavor to plain rice, dal, and warm rotis."
    },
    ingredients: ["Plump Garlic Cloves", "Mustard Seed Oil", "Turmeric & Salt", "Red Chili Powder", "Amchur (Mango Powder)"],
    nutrition: {
      calories: "160 kcal",
      protein: "2.4g",
      carbohydrates: "10.2g",
      fats: "11.8g",
      servingSize: "15g (1 Tablespoon)"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["mango-pickle", "green-chilli", "combo-box"]
  },
  "lemon-pickle": {
    name: "Swadyum Lemon Pickle",
    tagline: "Oil-Free Sweet & Sour Zesty Lemon",
    description: "Authentic homemade lemon pickle inspired by traditional Bihar recipes. Prepared without a drop of oil, sun-matured lemon halves cured slowly with sugar, salt, and spices.",
    prices: { "250g": 279, "500g": 479, "1kg": 789 },
    rating: 4.7,
    reviewsCount: 64,
    images: ["/prod_lemon.png", "/deal_scatter.png", "/gal_cut.png"],
    story: {
      headline: "The Art of Oil-Free Sun Curing",
      narrative: "Our lemon pickle utilizes a time-honored oil-free maturation technique. Sunning the jars for over forty days allows the lemon skins to soften naturally, building a complex sweet-and-sour glaze that settles beautifully on the tongue."
    },
    ingredients: ["Fresh Lemon Halves", "Salt & Sugar", "Ajwain (Carom Seeds)", "Kala Namak", "Traditional Spice Blend"],
    nutrition: {
      calories: "110 kcal",
      protein: "0.8g",
      carbohydrates: "24.5g",
      fats: "0.2g",
      servingSize: "15g (1 Tablespoon)"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["mango-pickle", "mixed-pickle", "green-chilli"]
  },
  "green-chilli": {
    name: "Swadyum Stuffed Green Chilli",
    tagline: "Fiery Stuffed Chili Pickle",
    description: "Authentic homemade green chili pickle inspired by traditional Bihar recipes. Sturdy local green chilies hand-stuffed with roasted spice blends and cold-pressed mustard oil.",
    prices: { "250g": 289, "500g": 489, "1kg": 799 },
    rating: 4.9,
    reviewsCount: 112,
    images: ["/prod_chili.png", "/deal_scatter.png", "/gal_mix.png"],
    story: {
      headline: "An Intense Flavor Legacy",
      narrative: "Each green chili is slit precisely by our master spice artisans, stuffed with a blend of ground dry mango and yellow mustard seeds, and gently lowered into earthen jars. A punchy pickle designed for the true spice enthusiast."
    },
    ingredients: ["Fresh Green Chilies", "Cold-Pressed Mustard Oil", "Amchur Powder", "Fennel Seeds", "Traditional Spice Blend"],
    nutrition: {
      calories: "135 kcal",
      protein: "1.0g",
      carbohydrates: "7.8g",
      fats: "12.0g",
      servingSize: "15g (1 Tablespoon)"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["mango-pickle", "garlic-pickle", "mixed-pickle"]
  },
  "mixed-pickle": {
    name: "Swadyum Assorted Mixed Pickle",
    tagline: "The Harmony of Bihar's Harvest",
    description: "Authentic homemade mixed pickle inspired by traditional Bihar recipes. A blend of handpicked green mangoes, lemons, carrots, and garlic cloves matured together.",
    prices: { "250g": 299, "500g": 499, "1kg": 819 },
    rating: 4.8,
    reviewsCount: 88,
    images: ["/cat_mixed.png", "/deal_scatter.png", "/about_us.png"],
    story: {
      headline: "A Colorful Kitchen Celebration",
      narrative: "Mixed pickle represents the culinary diversity of a Bihari kitchen. In one jar, the tartness of raw mangoes balances the zesty sweet lemon, crisp carrots, and aromatic garlic, building a beautiful multi-layered texture."
    },
    ingredients: ["Mango, Carrots & Lemon", "Mustard Seed Oil", "Garlic Cloves", "Turmeric & Salt", "Traditional Spice Blend"],
    nutrition: {
      calories: "140 kcal",
      protein: "1.1g",
      carbohydrates: "9.5g",
      fats: "12.1g",
      servingSize: "15g (1 Tablespoon)"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["mango-pickle", "lemon-pickle", "combo-box"]
  },
  "combo-box": {
    name: "Bestseller Bihar Special Combo Box",
    tagline: "Four Signature Flavors in One Box",
    description: "Authentic homemade pickle gift box inspired by traditional Bihar recipes. Features four of our bestselling varieties in premium 250g rigid jars.",
    prices: { "4x250g": 899 },
    rating: 5.0,
    reviewsCount: 220,
    images: ["/deal_scatter.png", "/prod_mango.png", "/prod_garlic.png"],
    story: {
      headline: "The Ultimate Bihari Culinary Gift",
      narrative: "Designed to share and celebrate heritage. This bestseller box brings the heart of Bihar's food culture straight to your dining table or into the hands of your loved ones, packaged beautifully in a rigid gold-gilt box."
    },
    ingredients: ["Mango Pickle (250g)", "Garlic Pickle (250g)", "Lemon Pickle (250g)", "Green Chilli Achar (250g)"],
    nutrition: {
      calories: "140 kcal avg",
      protein: "1.3g avg",
      carbohydrates: "9.8g avg",
      fats: "11.6g avg",
      servingSize: "15g per jar variety"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["mango-pickle", "garlic-pickle", "mixed-pickle"]
  },
  "festive-box": {
    name: "Festive Heritage Assortment Box",
    tagline: "A Grand Premium Gifting Chest",
    description: "Authentic homemade festive chest inspired by traditional Bihar recipes. Features two signature pickle jars, stone-ground spices, and organic sattu flour.",
    prices: { "Set": 999 },
    rating: 4.9,
    reviewsCount: 45,
    images: ["/about_us.png", "/deal_scatter.png", "/prod_mango.png"],
    story: {
      headline: "Festive Joy Sourced with Care",
      narrative: "A premium wooden chest celebrating the culinary heritage of Bihar. Ideal for festivals, weddings, and special events, showcasing the finest handcrafted items from local farms."
    },
    ingredients: ["Mango Pickle (250g)", "Garlic Pickle (250g)", "Organic Sattu Flour (500g)", "Traditional Spice Pack"],
    nutrition: {
      calories: "135 kcal avg",
      protein: "2.1g avg",
      carbohydrates: "12.5g avg",
      fats: "9.2g avg",
      servingSize: "Mixed food components"
    },
    benefits: ["Sun-Cured", "No Preservatives", "Handmade", "Small Batch Crafted", "Authentic Bihar Recipe"],
    related: ["combo-box", "mango-pickle", "garlic-pickle"]
  }
};

function ProductDetailsPage({ slug, onNavigate, addToCart }) {
  const p = productDetailsData[slug] || productDetailsData["mango-pickle"];
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(Object.keys(p.prices)[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([
    { id: 1, name: "Prerna Singh", rating: 5, date: "June 12, 2026", text: "Tastes exactly like the mango pickle my grandmother used to dry on the terrace. The mustard oil smell is so pure!" },
    { id: 2, name: "Mayank Sharma", rating: 5, date: "May 28, 2026", text: "The balance of spices is fantastic. It goes perfectly with warm parathas and ghee. Will buy again!" },
    { id: 3, name: "Aarav K.", rating: 4, date: "May 15, 2026", text: "Incredibly rich garlic pickle. High quality packaging, jars came safely." }
  ]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
  const [submitted, setSubmitted] = useState(false);

  // Reset active tabs on slug change
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSize(Object.keys(p.prices)[0]);
    setQuantity(1);
    setSubmitted(false);
    setNewReview({ name: '', rating: 5, text: '' });
  }, [slug]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setReviews([
      { id: Date.now(), name: newReview.name, rating: newReview.rating, date: dateStr, text: newReview.text },
      ...reviews
    ]);
    setSubmitted(true);
  };

  return (
    <div className="product-details-wrapper">
      
      {/* HEADER BREADCRUMB */}
      <div className="details-breadcrumb-container">
        <div className="details-breadcrumb">
          <span className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link" onClick={() => onNavigate('shop')}>Shop</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{p.name}</span>
        </div>
      </div>

      {/* SECTION 01: PRODUCT HERO */}
      <section className="product-hero-section">
        <div className="product-hero-container">
          
          {/* Left Side: Image Gallery */}
          <div className="product-hero-images">
            <div className="product-thumbnails-list">
              {p.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-item ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`${p.name} view ${idx + 1}`} />
                </div>
              ))}
            </div>

            <div className="product-main-display">
              <div className="paper-texture-effect"></div>
              <img src={p.images[activeImageIndex]} alt={p.name} className="main-display-img" />
              {p.isBestseller && <span className="bestseller-badge">Bestseller</span>}
            </div>
          </div>

          {/* Right Side: Product Information */}
          <div className="product-hero-info">
            <span className="product-meta-category">{p.tagline}</span>
            <h1 className="product-meta-title">{p.name}</h1>
            
            <div className="product-meta-rating-row">
              <span className="rating-stars-gold">{"★".repeat(Math.floor(p.rating))}</span>
              <span className="rating-text-value">{p.rating} ({p.reviewsCount} verified reviews)</span>
            </div>

            <p className="product-meta-desc">{p.description}</p>

            {/* Price Table sizes */}
            <div className="product-meta-pricing">
              <span className="pricing-label">Select Size</span>
              <div className="size-buttons-grid">
                {Object.keys(p.prices).map((weight) => (
                  <button
                    key={weight}
                    className={`size-btn ${selectedSize === weight ? 'active' : ''}`}
                    onClick={() => setSelectedSize(weight)}
                  >
                    <span className="size-weight">{weight}</span>
                    <span className="size-price">₹{p.prices[weight]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="product-purchase-actions-container">
              
              <div className="quantity-selector-box">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span className="qty-number">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>

              <button 
                className="add-to-cart-action-btn"
                onClick={() => addToCart({ slug, name: p.name, prices: p.prices, image: p.images[0] }, selectedSize, quantity)}
              >
                Add To Cart
              </button>
 
              <button 
                className="buy-now-action-btn"
                onClick={() => {
                  addToCart({ slug, name: p.name, prices: p.prices, image: p.images[0] }, selectedSize, quantity);
                  onNavigate('checkout');
                }}
              >
                Buy Now
              </button>

              <button 
                className={`wishlist-action-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Add to Wishlist"
              >
                {isWishlisted ? "❤️" : "🖤"}
              </button>

            </div>

            {/* Trust Badges Summary */}
            <div className="product-trust-pillars-strip">
              <div className="trust-pill-item"><span className="tp-icon">🌱</span> 100% Organic Ingredients</div>
              <div className="trust-pill-item"><span className="tp-icon">🏺</span> Aged in Earthen Jars</div>
              <div className="trust-pill-item"><span className="tp-icon">🚚</span> Shipped Safely Pan-India</div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 02: STORY SECTION */}
      <section className="product-story-section">
        <div className="product-story-container">
          <div className="product-story-card">
            <span className="section-subtitle">~ Heritage Story ~</span>
            <h2 className="section-headline">{p.story.headline}</h2>
            <p className="story-narrative-text">{p.story.narrative}</p>
          </div>
        </div>
      </section>

      {/* SECTION 03: INGREDIENTS SECTION */}
      <section className="product-ingredients-section">
        <div className="ingredients-container">
          <div className="ingredients-header">
            <span className="section-subtitle">~ Sourced with Care ~</span>
            <h2 className="section-headline">Natural Ingredients</h2>
          </div>

          <div className="ingredients-visual-grid">
            {p.ingredients.map((ing, idx) => (
              <div key={idx} className="ingredient-visual-card">
                <div className="ingredient-circle-icon">
                  <span className="ingredient-bullet">✦</span>
                </div>
                <h4 className="ingredient-card-name">{ing}</h4>
                <p className="ingredient-card-note">100% natural, locally sourced</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 04: NUTRITIONAL INFORMATION */}
      <section className="product-nutrition-section">
        <div className="nutrition-container">
          <div className="nutrition-header">
            <span className="section-subtitle">~ Lab Certified ~</span>
            <h2 className="section-headline">Nutritional Facts</h2>
          </div>

          <div className="nutrition-table-box">
            <table className="premium-nutrition-table">
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th>Amount per Serving</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Serving Size</strong></td>
                  <td>{p.nutrition.servingSize}</td>
                </tr>
                <tr>
                  <td>Calories</td>
                  <td>{p.nutrition.calories}</td>
                </tr>
                <tr>
                  <td>Protein</td>
                  <td>{p.nutrition.protein}</td>
                </tr>
                <tr>
                  <td>Carbohydrates</td>
                  <td>{p.nutrition.carbohydrates}</td>
                </tr>
                <tr>
                  <td>Fats</td>
                  <td>{p.nutrition.fats}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 05: BENEFITS SECTION */}
      <section className="product-benefits-section">
        <div className="benefits-container">
          <div className="benefits-header">
            <span className="section-subtitle">~ Why Swadyum ~</span>
            <h2 className="section-headline">Our Core Promises</h2>
          </div>

          <div className="benefits-list-row">
            {p.benefits.map((benefit, idx) => (
              <div key={idx} className="benefit-list-card">
                <span className="benefit-star">✦</span>
                <span className="benefit-label">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 06: REVIEWS */}
      <section className="product-reviews-section">
        <div className="reviews-container">
          
          <div className="reviews-grid-split">
            
            {/* Left Column: Rating breakdown and Customer submissions */}
            <div className="reviews-summary-column">
              <span className="section-subtitle">~ Verified Ratings ~</span>
              <h2 className="section-headline">Customer Feedbacks</h2>

              <div className="ratings-breakdown-box">
                <div className="large-rating-num">{p.rating}</div>
                <div className="stars-row">★★★★★</div>
                <div className="rating-desc-label">Based on {p.reviewsCount} reviews</div>
              </div>

              {/* Review Submission Form */}
              <div className="review-submission-form-box">
                <h3 className="form-title">Write a Review</h3>
                
                {submitted ? (
                  <div className="form-submit-success">
                    <span className="success-icon">✓</span>
                    <p>Thank you! Your verified review has been submitted.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="review-form">
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={newReview.name}
                        onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <select 
                        value={newReview.rating} 
                        onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className="form-select"
                      >
                        <option value="5">5 Stars (Excellent)</option>
                        <option value="4">4 Stars (Good)</option>
                        <option value="3">3 Stars (Average)</option>
                        <option value="2">2 Stars (Poor)</option>
                        <option value="1">1 Star (Very Poor)</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <textarea 
                        placeholder="Share your kitchen experience with this achar..." 
                        rows="4"
                        value={newReview.text}
                        onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                        className="form-textarea"
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="submit-review-btn">
                      Submit Review
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Right Column: Visual reviews and feedback lists */}
            <div className="reviews-list-column">
              
              {/* Media reviews files */}
              <div className="reviews-media-block">
                <span className="media-section-title">Customer Photos & Video Clips</span>
                <div className="media-thumbnails-grid">
                  <div className="media-thumb-item">
                    <img src="/gal_mix.png" alt="Customer shared pickle jar" />
                    <span className="photo-play-overlay">📸</span>
                  </div>
                  <div className="media-thumb-item">
                    <img src="/deal_scatter.png" alt="Customer shared unboxing combo" />
                    <span className="photo-play-overlay">📸</span>
                  </div>
                  <div className="media-thumb-item video-item">
                    <img src="/gal_cut.png" alt="Customer sharing recipe clip" />
                    <span className="video-play-overlay">▶</span>
                  </div>
                </div>
              </div>

              {/* Review Feedbacks List */}
              <div className="reviews-feedbacks-list">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-feedback-card">
                    <div className="rf-header">
                      <span className="rf-author">{rev.name}</span>
                      <span className="rf-date">{rev.date}</span>
                    </div>
                    <div className="rf-rating">{"★".repeat(rev.rating)}</div>
                    <p className="rf-text">{rev.text}</p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 07: RELATED PRODUCTS */}
      <section className="product-related-section">
        <div className="related-container">
          <div className="related-header">
            <span className="section-subtitle">~ Perfect Pairings ~</span>
            <h2 className="section-headline">Recommended Cross-Sells</h2>
          </div>

          <div className="related-grid">
            {p.related.map((slug) => {
              const rel = productDetailsData[slug];
              if (!rel) return null;
              return (
                <div 
                  key={slug} 
                  className="related-product-card"
                  onClick={() => onNavigate('product-' + slug)}
                >
                  <img src={rel.images[0]} alt={rel.name} className="related-img" />
                  <h4 className="related-title">{rel.name}</h4>
                  <span className="related-price">From ₹{Object.values(rel.prices)[0]}</span>
                  <button className="related-view-btn">View Details</button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 08: STICKY MOBILE CTA BAR */}
      <div className="product-sticky-mobile-cta">
        <div className="mobile-cta-price-info">
          <span className="m-title">{p.name}</span>
          <span className="m-price">₹{p.prices[selectedSize]}</span>
        </div>
        <div className="mobile-cta-buttons">
          <button className="mobile-add-cart-btn">Add To Cart</button>
          <button className="mobile-buy-btn">Buy Now</button>
        </div>
      </div>

    </div>
  );
}

export default ProductDetailsPage;
