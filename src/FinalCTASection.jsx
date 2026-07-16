import React from 'react';
import { motion } from 'framer-motion';
import './FinalCTASection.css';

function FinalCTASection({ onNavigate }) {
  return (
    <section className="final-cta-section">
      <div className="final-cta-bg-pattern"></div>
      <motion.div
        className="final-cta-content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="section-eyebrow" style={{ color: 'var(--brand-primary)', opacity: 0.6, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Heritage Taste Guarantee
        </span>

        <h2 className="final-cta-headline">
          Bring Home Real Bihari Mango Pickle
        </h2>

        <p className="final-cta-subtext">
          Tangy, spicy, sun-cured, and made with cold-pressed mustard oil. Start with one jar before you commit to more.
        </p>

        <div className="final-cta-buttons">
          <button
            className="final-cta-primary"
            onClick={() => onNavigate && onNavigate('product-mango-pickle')}
            aria-label="Buy Mango Pickle - ₹299"
          >
            Buy Mango Pickle - ₹299
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <p className="final-cta-proof-line">
          Free shipping above ₹799 • Delivered in 3-5 days
        </p>
      </motion.div>
    </section>
  );
}

export default FinalCTASection;
