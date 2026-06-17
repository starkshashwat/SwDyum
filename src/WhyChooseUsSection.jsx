import React from 'react';
import './WhyChooseUsSection.css';

function WhyChooseUsSection() {
  return (
    <section className="why-choose-us-section">
      <div className="why-container">
        
        {/* Left Side: Features Grid */}
        <div className="features-grid">
          <div className="feature-box">
            <div className="icon-circle feature-icon-bg">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <h4 className="feature-title">Authentic Recipes</h4>
            <p className="feature-desc">Preserving generations of traditional Bihari flavors.</p>
          </div>
          
          <div className="feature-box">
            <div className="icon-circle feature-icon-bg">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="feature-title">100% Homemade</h4>
            <p className="feature-desc">Handcrafted in small batches without preservatives.</p>
          </div>
          
          <div className="feature-box">
            <div className="icon-circle feature-icon-bg">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h4 className="feature-title">Secure Payment</h4>
            <p className="feature-desc">100% secure payment processing for your peace of mind.</p>
          </div>
          
          <div className="feature-box">
            <div className="icon-circle feature-icon-bg">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </div>
            <h4 className="feature-title">Pan-India Shipping</h4>
            <p className="feature-desc">Delivering the taste of Bihar to every corner of India.</p>
          </div>
        </div>

        {/* Right Side: Text */}
        <div className="why-content">
          <span className="section-subtitle">~ Why Choose Us ~</span>
          <h2 className="section-headline">We do not buy from mass producers or factories.</h2>
          <p className="why-text">
            Sourcing ingredients directly from local farmers in Bihar allows us to maintain the highest quality standards. We believe in authenticity, which is why we never use artificial preservatives, colors, or factory-made spice blends.
          </p>
          <p className="why-text">
            Swadyum is a family-run brand. Our pickles and spices are prepared in small batches using traditional sun-drying methods, ensuring every jar delivers the exact taste you'd find in a traditional Bihari home.
          </p>
        </div>

      </div>

      {/* Stats Banner at the bottom */}
      <div className="stats-banner">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">10,000<span>+</span></h3>
              <p className="stat-label">Happy Customers</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">50<span>+</span></h3>
              <p className="stat-label">Artisan Makers</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">15<span>+</span></h3>
              <p className="stat-label">Authentic Varieties</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">5<span>+</span></h3>
              <p className="stat-label">Awards Winning</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
