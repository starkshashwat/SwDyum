import React, { useState, useEffect } from 'react';
import './ProductDetailsPage.css';

import { getProductBySlug, getRelatedProducts } from './data/products';


function ProductDetailsPage({ slug, onNavigate, addToCart }) {
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [subscription, setSubscription] = useState('One Time');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

  // Review states
  const [reviews, setReviews] = useState([
    { id: 1, name: "Prerna Singh", rating: 5, date: "June 12, 2026", text: "Tastes exactly like the mango pickle my grandmother used to dry on the terrace. The mustard oil smell is so pure!" },
    { id: 2, name: "Mayank Sharma", rating: 5, date: "May 28, 2026", text: "The balance of spices is fantastic. It goes perfectly with warm parathas and ghee. Will buy again!" },
    { id: 3, name: "Aarav K.", rating: 4, date: "May 15, 2026", text: "Incredibly rich garlic pickle. High quality packaging, jars came safely." }
  ]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await getProductBySlug(slug);
      if (data) {
        const related = await getRelatedProducts(data.id, 3);
        setP({
          ...data,
          tagline: data.tagline || "Artisanal Homemade Goodness",
          images: data.images?.length > 0 ? data.images : ["/deal_scatter.png", "/about_us.png"],
          story: {
            headline: "A Recipe Passed Through Generations",
            narrative: "Handcrafted using traditional methods passed down through families, ensuring every bite is authentic and full of regional flavor."
          },
          ingredients: ["Natural Produce", "Cold-Pressed Mustard Oil", "Traditional Spices"],
          nutrition: {
            calories: "140 kcal",
            protein: "1.0g",
            carbohydrates: "10.0g",
            fats: "10.0g",
            servingSize: "15g"
          },
          benefits: ["Sun-Cured", "No Preservatives", "Handmade"],
          related: related
        });
        setSelectedSize(Object.keys(data.prices)[0] || '250g');
      }
      setLoading(false);
    };
    loadProduct();
  }, [slug]);

  // Reset active tabs on slug change
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setSubscription('One Time');
    setSubmitted(false);
    setNewReview({ name: '', rating: 5, text: '' });
    setActiveTab('story');
  }, [slug]);

  if (loading) return <div className="product-details-wrapper p-20 text-center">Loading...</div>;
  if (!p) return <div className="product-details-wrapper p-20 text-center">Product not found.</div>;

  const handleTabKeyDown = (e, tab) => {
    const tabs = ['story', 'ingredients', 'nutrition', 'promises'];
    const idx = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') {
      const nextIdx = (idx + 1) % tabs.length;
      setActiveTab(tabs[nextIdx]);
      setTimeout(() => {
        const btn = document.querySelectorAll('.specs-tab-btn')[nextIdx];
        if (btn) btn.focus();
      }, 0);
    } else if (e.key === 'ArrowLeft') {
      const prevIdx = (idx - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIdx]);
      setTimeout(() => {
        const btn = document.querySelectorAll('.specs-tab-btn')[prevIdx];
        if (btn) btn.focus();
      }, 0);
    }
  };

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
              <img key={activeImageIndex} src={p.images[activeImageIndex]} alt={p.name} className="main-display-img" />
              {p.isBestseller && <span className="bestseller-badge">Bestseller</span>}
            </div>
          </div>

          {/* Right Side: Product Information */}
          <div className="product-hero-info">
            <span className="product-meta-category">{p.category}</span>
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
            <div className="product-subscription-selector">
              <span className="pricing-label">Delivery Frequency</span>
              <div className="subscription-buttons-row">
                {['One Time', 'Monthly', 'Quarterly'].map(sub => (
                  <button 
                    key={sub}
                    className={`sub-btn ${subscription === sub ? 'active' : ''}`}
                    onClick={() => setSubscription(sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown & Low Stock */}
            <div className="product-urgency-box">
              <div className="urgency-stock">
                <span>🔥</span> Hurry! Only <strong>{Math.floor(Math.random() * 8) + 2}</strong> left in stock!
              </div>
              <div className="urgency-timer">
                <span>⏳</span> Sale ends in: <strong>03h 45m 12s</strong>
              </div>
            </div>

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
                onClick={() => addToCart({ slug, name: p.name, prices: p.prices, image: p.images[0] }, selectedSize, quantity, subscription)}
              >
                Add To Cart
              </button>
 
              <button 
                className="buy-now-action-btn"
                onClick={() => {
                  addToCart({ slug, name: p.name, prices: p.prices, image: p.images[0] }, selectedSize, quantity, subscription);
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

      {/* SECTION 02: PRODUCT SPECIFICATION TABS */}
      <section className="product-specs-tabs-section">
        <div className="specs-tabs-container">
          <div className="specs-tabs-nav" role="tablist" aria-label="Product specifications">
            <button 
              className={`specs-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'story'}
              aria-controls="story-tab-panel"
              id="story-tab"
              onClick={() => setActiveTab('story')}
              onKeyDown={(e) => handleTabKeyDown(e, 'story')}
            >
              Heritage Story
            </button>
            <button 
              className={`specs-tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'ingredients'}
              aria-controls="ingredients-tab-panel"
              id="ingredients-tab"
              onClick={() => setActiveTab('ingredients')}
              onKeyDown={(e) => handleTabKeyDown(e, 'ingredients')}
            >
              Ingredients
            </button>
            <button 
              className={`specs-tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'nutrition'}
              aria-controls="nutrition-tab-panel"
              id="nutrition-tab"
              onClick={() => setActiveTab('nutrition')}
              onKeyDown={(e) => handleTabKeyDown(e, 'nutrition')}
            >
              Nutrition Facts
            </button>
            <button 
              className={`specs-tab-btn ${activeTab === 'promises' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'promises'}
              aria-controls="promises-tab-panel"
              id="promises-tab"
              onClick={() => setActiveTab('promises')}
              onKeyDown={(e) => handleTabKeyDown(e, 'promises')}
            >
              Our Promises
            </button>
          </div>

          <div className="specs-tab-content-panel">
            {activeTab === 'story' && (
              <div 
                className="tab-pane-content story-pane" 
                role="tabpanel" 
                id="story-tab-panel" 
                aria-labelledby="story-tab"
              >
                <span className="section-subtitle">~ Heritage Story ~</span>
                <h3 className="section-headline">{p.story.headline}</h3>
                <p className="story-narrative-text">{p.story.narrative}</p>
              </div>
            )}
            
            {activeTab === 'ingredients' && (
              <div 
                className="tab-pane-content ingredients-pane" 
                role="tabpanel" 
                id="ingredients-tab-panel" 
                aria-labelledby="ingredients-tab"
              >
                <span className="section-subtitle">~ Sourced with Care ~</span>
                <h3 className="section-headline">Natural Ingredients</h3>
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
            )}

            {activeTab === 'nutrition' && (
              <div 
                className="tab-pane-content nutrition-pane" 
                role="tabpanel" 
                id="nutrition-tab-panel" 
                aria-labelledby="nutrition-tab"
              >
                <span className="section-subtitle">~ Lab Certified ~</span>
                <h3 className="section-headline">Nutritional Facts</h3>
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
            )}

            {activeTab === 'promises' && (
              <div 
                className="tab-pane-content promises-pane" 
                role="tabpanel" 
                id="promises-tab-panel" 
                aria-labelledby="promises-tab"
              >
                <span className="section-subtitle">~ Why Swadyum ~</span>
                <h3 className="section-headline">Our Core Promises</h3>
                <div className="benefits-list-row">
                  {p.benefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-list-card">
                      <span className="benefit-star">✦</span>
                      <span className="benefit-label">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {p.related.map((rel) => {
              if (!rel) return null;
              return (
                <div 
                  key={rel.slug} 
                  className="related-product-card"
                  onClick={() => onNavigate('product-' + rel.slug)}
                >
                  <img src={rel.image} alt={rel.name} className="related-img" />
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
          <button 
            className="mobile-add-cart-btn"
            onClick={() => addToCart({ slug, name: p.name, prices: p.prices, image: p.images[0] }, selectedSize, quantity, subscription)}
          >
            Add To Cart
          </button>
          <button 
            className="mobile-buy-btn"
            onClick={() => {
              addToCart({ slug, name: p.name, prices: p.prices, image: p.images[0] }, selectedSize, quantity, subscription);
              onNavigate('checkout');
            }}
          >
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
}

export default ProductDetailsPage;
