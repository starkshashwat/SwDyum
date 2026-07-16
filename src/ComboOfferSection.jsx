import React from 'react';
import { motion } from 'framer-motion';
import './ComboOfferSection.css';

const combos = [
  {
    id: 'combo-1',
    title: 'The Bihari Heritage Box',
    description: 'Our four bestselling pickles in a premium rigid box. Perfect for gifting or stocking your pantry with authentic flavors.',
    includes: ['Signature Mango', 'Authentic Garlic', 'Stuffed Green Chilli', 'Sweet & Sour Lemon'],
    price: 999,
    oldPrice: 1187,
    save: 188,
    image: '/banner.webp', // Fallback to banner, assuming we don't have a dedicated combo box image yet
    popular: true
  },
  {
    id: 'combo-2',
    title: 'The Spicy Duo',
    description: 'A fiery combination for those who love a kick in every bite.',
    includes: ['Authentic Garlic', 'Stuffed Green Chilli'],
    price: 549,
    oldPrice: 598,
    save: 49,
    image: '/prod_chili.webp'
  }
];

function ComboOfferSection({ onNavigate, addToCart }) {
  const handleQuickAdd = (combo) => {
    if (addToCart) {
      // Add each item in the combo
      addToCart({ name: combo.title, price: combo.price, image: combo.image }, 'Combo Pack', 1);
    }
  };

  return (
    <section className="combo-section section-padding">
      <div className="section-container">
        <div className="combo-header text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-eyebrow">Curated Collections</span>
            <h2 className="section-title">Save More With <em>Combos</em></h2>
            <p className="section-subtitle-text">
              Premium gift boxes and bundled deals for the ultimate Swadyum experience.
            </p>
          </motion.div>
        </div>

        <div className="combo-grid">
          {combos.map((combo, i) => (
            <motion.div 
              className={`combo-card ${combo.popular ? 'combo-featured' : ''}`}
              key={combo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {combo.popular && (
                <div className="combo-badge-popular">Most Popular</div>
              )}
              
              <div className="combo-image-col">
                <div className="combo-image-wrapper">
                  {/* Using a placeholder or existing image approach */}
                  <div className="combo-image-overlay"></div>
                  <img src={combo.image} alt={combo.title} className="combo-img" loading="lazy" />
                  <div className="combo-save-badge">Save ₹{combo.save}</div>
                </div>
              </div>

              <div className="combo-content-col">
                <h3 className="combo-title">{combo.title}</h3>
                <p className="combo-desc">{combo.description}</p>
                
                <div className="combo-includes">
                  <span className="combo-includes-title">What's Inside:</span>
                  <ul className="combo-includes-list">
                    {combo.includes.map((item, idx) => (
                      <li key={idx}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="combo-check-icon">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {item} (250g)
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="combo-action-area">
                  <div className="combo-pricing">
                    <span className="combo-price">₹{combo.price}</span>
                    <span className="combo-old-price">₹{combo.oldPrice}</span>
                  </div>
                  
                  <button 
                    className="primary-cta combo-btn"
                    onClick={() => handleQuickAdd(combo)}
                    aria-label={`Add ${combo.title} to cart`}
                  >
                    Add to Cart
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComboOfferSection;
