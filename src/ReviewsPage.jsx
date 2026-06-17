import React, { useState } from 'react';
import './ReviewsPage.css';

const initialReviews = [
  { id: 1, name: "Prerna Singh", rating: 5, date: "June 12, 2026", text: "Tastes exactly like the mango pickle my grandmother used to dry on the terrace. The mustard oil smell is so pure!" },
  { id: 2, name: "Mayank Sharma", rating: 5, date: "May 28, 2026", text: "The balance of spices is fantastic. It goes perfectly with warm parathas and ghee. Will buy again!" },
  { id: 3, name: "Aarav K.", rating: 4, date: "May 15, 2026", text: "Incredibly rich garlic pickle. High quality packaging, jars came safely." },
  { id: 4, name: "Dr. Shalini Sinha", rating: 5, date: "April 20, 2026", text: "Oil-free lemon pickle is perfect for senior family members. Not too salty, just the right amount of sweet and sour maturity." }
];

function ReviewsPage({ onNavigate }) {
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setReviewsList([
      { id: Date.now(), name: newReview.name, rating: newReview.rating, date: dateStr, text: newReview.text },
      ...reviewsList
    ]);
    setSubmitted(true);
    setNewReview({ name: '', rating: 5, text: '', email: '' });
  };

  return (
    <div className="reviews-page-wrapper">
      
      {/* 1. HERO BANNER */}
      <section className="reviews-hero-section" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.7)), url('/about_us.png')` }}>
        <div className="reviews-hero-container">
          <span className="reviews-hero-subtitle">~ Pure Customer Love ~</span>
          <h1 className="reviews-hero-title">Loved By Families Across India</h1>
          <p className="reviews-hero-desc">Authentic feedback from domestic tables celebrating the restoration of traditional solar curing processes.</p>
        </div>
      </section>

      {/* 2. TRUST METRICS STRIP */}
      <section className="reviews-trust-metrics-section">
        <div className="metrics-container">
          <div className="metrics-row">
            <div className="metric-box">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="metric-box">
              <h3>4.9 ★</h3>
              <p>Average Rating</p>
            </div>
            <div className="metric-box">
              <h3>95%</h3>
              <p>Repeat Orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RATING BREAKDOWN & STATISTICS */}
      <section className="reviews-statistics-section">
        <div className="stats-container">
          <div className="stats-grid-split">
            
            {/* Left Box: Big Number */}
            <div className="stats-overall-card">
              <h2>4.9</h2>
              <div className="stars-rating-row">★★★★★</div>
              <p>Based on 1,480 verified purchases</p>
            </div>

            {/* Right Box: Breakdown Bars */}
            <div className="stats-breakdown-card">
              <div className="breakdown-bar-row">
                <span className="bar-label">5 Stars</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '92%' }}></div></div>
                <span className="bar-percentage">92%</span>
              </div>
              <div className="breakdown-bar-row">
                <span className="bar-label">4 Stars</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '6%' }}></div></div>
                <span className="bar-percentage">6%</span>
              </div>
              <div className="breakdown-bar-row">
                <span className="bar-label">3 Stars</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '1.5%' }}></div></div>
                <span className="bar-percentage">1.5%</span>
              </div>
              <div className="breakdown-bar-row">
                <span className="bar-label">2 Stars</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '0.5%' }}></div></div>
                <span className="bar-percentage">0.5%</span>
              </div>
              <div className="breakdown-bar-row">
                <span className="bar-label">1 Star</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '0%' }}></div></div>
                <span className="bar-percentage">0%</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. VIDEO REVIEWS */}
      <section className="reviews-video-section">
        <div className="video-reviews-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ Unboxing & Kitchen Clips ~</span>
            <h2 className="section-headline">Customer Video Reviews</h2>
          </div>

          <div className="video-reviews-grid">
            <div className="video-review-card">
              <div className="video-thumbnail-box">
                <img src="/gal_cut.png" alt="Video review thumbnail 1" />
                <span className="video-play-btn">▶</span>
              </div>
              <h4>"Pure nostalgia in a jar"</h4>
              <p>Rohan S. from Delhi shares his unboxing experience of the Bestseller Box.</p>
            </div>

            <div className="video-review-card">
              <div className="video-thumbnail-box">
                <img src="/gal_mix.png" alt="Video review thumbnail 2" />
                <span className="video-play-btn">▶</span>
              </div>
              <h4>"Like grandmas rooftop"</h4>
              <p>Simran P. from Bangalore explains why the raw mustard aroma is authentic.</p>
            </div>

            <div className="video-review-card">
              <div className="video-thumbnail-box">
                <img src="/about_us.png" alt="Video review thumbnail 3" />
                <span className="video-play-btn">▶</span>
              </div>
              <h4>"The perfect sattu pairing"</h4>
              <p>Aditya K. from Mumbai reviews the stuffed green chilli pickle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER PHOTOS & UGC GALLERY */}
      <section className="reviews-ugc-section">
        <div className="ugc-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ UGC Gallery ~</span>
            <h2 className="section-headline">Shared from Indian Kitchens</h2>
          </div>

          <div className="ugc-gallery-grid">
            <div className="ugc-item"><img src="/prod_mango.png" alt="Mango jar on table" /></div>
            <div className="ugc-item"><img src="/deal_scatter.png" alt="Achar with parathas" /></div>
            <div className="ugc-item"><img src="/cat_mixed.png" alt="Clay pot packing" /></div>
            <div className="ugc-item"><img src="/prod_garlic.png" alt="Garlic cloves on brass plate" /></div>
            <div className="ugc-item"><img src="/gal_cut.png" alt="Opening security seals" /></div>
            <div className="ugc-item"><img src="/gal_mix.png" alt="Mango pickle slices up close" /></div>
          </div>
        </div>
      </section>

      {/* 6. INSTAGRAM REELS FEED PLACEHOLDER */}
      <section className="reviews-instagram-section">
        <div className="instagram-container">
          <div className="instagram-box">
            <span className="ig-icon">📸</span>
            <h3>Follow our Sun-Maturing Process on Instagram</h3>
            <p>We document every batch curing under solar heat. Tag us using <strong>#SwadyumFoods</strong> to get featured.</p>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="ig-follow-btn">@SwadyumFoods</a>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS & WRITE A REVIEW FORM */}
      <section className="reviews-feed-form-section">
        <div className="reviews-feed-container">
          <div className="feed-form-split-grid">
            
            {/* Left: Testimonials Feed */}
            <div className="testimonials-feed-box">
              <h3 className="feed-title">Latest Verified Reviews</h3>
              <div className="testimonials-list">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="testimonial-card">
                    <div className="tc-header">
                      <span className="tc-author">{rev.name}</span>
                      <span className="tc-date">{rev.date}</span>
                    </div>
                    <div className="tc-stars">{"★".repeat(rev.rating)}</div>
                    <p className="tc-text">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Review Form */}
            <div className="reviews-form-box">
              <div className="submit-form-card">
                <h3>Submit Your Review</h3>
                
                {submitted ? (
                  <div className="review-submit-success-state">
                    <span className="checkmark-icon">✓</span>
                    <h4>Review Submitted!</h4>
                    <p>Thank you for sharing your genuine experience with our heritage products.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="reviews-form-inputs">
                    <div className="form-group-row">
                      <label htmlFor="name">Your Name *</label>
                      <input 
                        type="text" 
                        id="name"
                        value={newReview.name}
                        onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="form-field"
                        placeholder="E.g. Siddharth Raj"
                      />
                    </div>

                    <div className="form-group-row">
                      <label htmlFor="email">Email Address *</label>
                      <input 
                        type="email" 
                        id="email"
                        value={newReview.email}
                        onChange={(e) => setNewReview(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="form-field"
                        placeholder="E.g. siddharth@gmail.com"
                      />
                    </div>

                    <div className="form-group-row">
                      <label htmlFor="rating">Star Rating</label>
                      <select 
                        id="rating"
                        value={newReview.rating}
                        onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className="form-field-select"
                      >
                        <option value="5">★★★★★ (5 Stars - Excellent)</option>
                        <option value="4">★★★★☆ (4 Stars - Good)</option>
                        <option value="3">★★★☆☆ (3 Stars - Average)</option>
                        <option value="2">★★☆☆☆ (2 Stars - Poor)</option>
                        <option value="1">★☆☆☆☆ (1 Star - Very Poor)</option>
                      </select>
                    </div>

                    <div className="form-group-row">
                      <label htmlFor="text">Your Kitchen Story *</label>
                      <textarea 
                        id="text"
                        rows="5"
                        value={newReview.text}
                        onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                        required
                        className="form-field-area"
                        placeholder="Tell us what dish you paired it with and how the flavors tasted..."
                      ></textarea>
                    </div>

                    <button type="submit" className="submit-review-form-btn">Submit Review</button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default ReviewsPage;
