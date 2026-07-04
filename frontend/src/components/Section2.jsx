import React from 'react';
import './Section2.css';

function Section2() {
  return (
    <div className="section2-container">
      {/* Promo Cards Section */}
      <div className="promo-grid">
        <div className="promo-card promo-mango">
          <div className="promo-content">
            <h2 className="promo-title">Get 10% off on Signature Mango</h2>
            <p className="promo-text">
              Shop our selection of authentic, sun-dried mango pickles at a discounted price. 10% off on all jars.
            </p>
            <button className="promo-btn promo-btn-outline">Shop now</button>
          </div>
          <div className="promo-image-wrapper">
            <img src="/promo1.png" alt="Mango Pickle" className="promo-img" />
          </div>
        </div>

        <div className="promo-card promo-spices">
          <div className="promo-content">
            <h2 className="promo-title">Taste authentic spices</h2>
            <p className="promo-text">
              Our pickles are crafted with farm-fresh spices and cold-pressed mustard oil for the perfect tang.
            </p>
            <button className="promo-btn promo-btn-solid">Shop now</button>
          </div>
          <div className="promo-image-wrapper">
            <img src="/promo2.png" alt="Spices and Pickles" className="promo-img" />
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="about-section">
        <div className="about-image-side">
          <div className="about-image-composition">
            {/* Green brush stroke background effect */}
            <div className="brush-stroke"></div>
            <img src="/about_us.png" alt="Fresh Ingredients" className="about-main-img" />
            <div className="fresh-badge">
              <span>100%<br/>Authentic</span>
            </div>
          </div>
        </div>

        <div className="about-text-side">
          <span className="section-subtitle">~ Our Story ~</span>
          <h2 className="section-headline">We believe in working with authentic local farmers</h2>
          
          <p className="about-description">
            Swadyum is a family-run brand founded on the principle of bringing the true taste of Bihar to your table. We preserve the age-old culinary traditions passed down through generations.
          </p>
          <p className="about-description">
            Authentic means growing our ingredients naturally, which is to nourish us without harmful chemicals or artificial preservatives during the preparation process.
          </p>

          <div className="about-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                {/* Farmer/Handcraft Icon */}
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              <div className="feature-text">
                <h4 className="feature-title">Why Homemade?</h4>
                <p>We ensure quality by handcrafting every batch with care.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                {/* Leaf/Spices Icon */}
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                </svg>
              </div>
              <div className="feature-text">
                <h4 className="feature-title">Speciality Spices</h4>
                <p>Sourced directly from farmers for the most authentic flavors.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section2;
