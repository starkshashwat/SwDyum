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
            <span className="pdp-combo-eyebrow">The Gift of Tradition</span>
            <h2 className="pdp-combo-heading">Experience Bihar in One Box</h2>
            <p className="pdp-combo-desc">
              Discover our curated combo gift sets. A perfect harmony of our finest pickles, beautifully packed for your loved ones.
            </p>
            <button className="pdp-combo-btn" onClick={() => onNavigate('shop')}>
              Explore Combo Packs
            </button>
          </motion.div>
        </div>
        <div className="pdp-combo-image">
          <motion.div 
            className="combo-spotlight"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Placeholder for Combo Box Image */}
            <div className="combo-placeholder-img">
              🎁 Premium Gift Box Render
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PdpComboSection;
