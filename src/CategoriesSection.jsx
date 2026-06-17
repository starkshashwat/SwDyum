import React from 'react';
import './CategoriesSection.css';

function CategoriesSection() {
  const categories = [
    {
      id: 1,
      title: 'Mango Pickle',
      subtitle: 'The timeless favorite.',
      image: '/cat_mango.png',
      cta: 'Explore Collection',
      class: 'cat-mango-hero'
    },
    {
      id: 2,
      title: 'Garlic Pickle',
      subtitle: 'Bold and aromatic.',
      image: '/cat_garlic.png',
      cta: 'Explore Collection',
      class: 'cat-garlic'
    },
    {
      id: 3,
      title: 'Lemon Pickle',
      subtitle: 'Tangy and refreshing.',
      image: '/prod_lemon.png',
      cta: 'Explore Collection',
      class: 'cat-lemon'
    },
    {
      id: 4,
      title: 'Green Chilli Pickle',
      subtitle: 'For spice lovers.',
      image: '/prod_chili.png',
      cta: 'Explore Collection',
      class: 'cat-chili'
    },
    {
      id: 5,
      title: 'Mixed Pickle',
      subtitle: 'A celebration of flavors.',
      image: '/cat_mixed.png',
      cta: 'Explore Collection',
      class: 'cat-mixed'
    },
    {
      id: 6,
      title: 'Bihar Heritage Collection',
      subtitle: 'Authentic flavors from Bihar.',
      image: '/deal_scatter.png',
      cta: 'Explore Collection',
      class: 'cat-heritage-full'
    }
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        
        {/* SECTION INTRO */}
        <div className="categories-intro">
          <span className="section-subtitle">~ Featured Collections ~</span>
          <h2 className="section-headline">
            Discover Bihar's<br />
            Most Loved Flavors
          </h2>
          <p className="categories-subtext">
            Crafted from traditional recipes and premium ingredients, each collection celebrates a different taste of Bihar.
          </p>
        </div>

        {/* ASYMMETRICAL EDITORIAL GRID */}
        <div className="categories-grid-magazine">
          {categories.map((cat) => (
            <div className={`category-magazine-card ${cat.class}`} key={cat.id}>
              
              {/* Card visual elements */}
              <div className="cat-card-visual">
                <img src={cat.image} alt={cat.title} className="cat-card-img" />
                <div className="cat-card-gradient"></div>
                <div className="cat-card-highlight"></div> {/* Golden spotlight overlay */}
              </div>

              {/* Card text and CTA buttons */}
              <div className="cat-card-info">
                <div className="cat-card-text">
                  <span className="cat-card-subtitle">{cat.subtitle}</span>
                  <h3 className="cat-card-title">{cat.title}</h3>
                </div>
                
                <div className="cat-card-cta-wrapper">
                  <button className="cat-card-explore-btn">
                    {cat.cta}
                    <svg className="cta-icon-arrow" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* BOTTOM GLOBAL CTA */}
        <div className="categories-footer">
          <button className="explore-all-gold-btn">
            Explore All Collections
          </button>
        </div>

      </div>
    </section>
  );
}

export default CategoriesSection;
