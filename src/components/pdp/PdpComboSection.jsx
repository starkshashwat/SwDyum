import React from 'react';
import { motion } from 'framer-motion';
import './PdpComboSection.css';

function PdpComboSection({ onNavigate }) {
  return (
    <section className="pdp-combo-section">
      <div className="pdp-combo-container">
        <div className="pdp-combo-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="pdp-combo-eyebrow">🎁 Save More · Bundle & Save</span>
            <h2 className="pdp-combo-heading">Experience Bihar in One Box</h2>
            <p className="pdp-combo-desc">
              Curated combo gift sets — a perfect harmony of our finest pickles, beautifully packed for your loved ones. Save up to 20% when you bundle.
            </p>
            <div className="pdp-combo-perks">
              <span className="pdp-combo-perk">✓ Free gift wrapping</span>
              <span className="pdp-combo-perk">✓ Up to 20% off</span>
              <span className="pdp-combo-perk">✓ Pan-India delivery</span>
            </div>
            <button className="pdp-combo-btn" onClick={() => onNavigate('shop')}>
              Explore Combo Packs →
            </button>
          </motion.div>
        </div>
        <motion.div
          className="pdp-combo-image"
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="combo-spotlight">
            <img src="/promo1.webp" alt="Premium pickle combo gift box" className="combo-img" loading="lazy" />
            <div className="combo-save-badge">SAVE 20%</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PdpComboSection;
