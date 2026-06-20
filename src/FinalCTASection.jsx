import React from 'react';
import { motion } from 'framer-motion';
import './FinalCTASection.css';

function FinalCTASection({ onNavigate }) {
  return (
    <section className="final-cta-section">
      <div className="final-cta-bg-pattern"></div>
      <motion.div
        className="final-cta-content"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
          From Our Kitchen to Yours
        </span>
        <h2 className="final-cta-headline">
          Ready to Taste the <em>Real</em> Bihar?
        </h2>
        <p className="final-cta-subtext">
          Join 10,000+ families who have rediscovered the authentic flavors of homemade pickles. Every jar is a promise of purity, tradition, and taste.
        </p>
        <div className="final-cta-buttons">
          <button
            className="final-cta-primary"
            onClick={() => onNavigate('shop')}
            aria-label="Browse our pickle collection"
          >
            Shop Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div className="final-cta-trust">
          <div className="final-cta-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Free shipping above ₹499
          </div>
          <div className="final-cta-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            100% quality guarantee
          </div>
          <div className="final-cta-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Delivered in 3-5 days
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default FinalCTASection;
