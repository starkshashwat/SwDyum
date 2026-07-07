import React from 'react';
import { motion } from 'framer-motion';
import './PdpUgc.css';

const ugcImages = [
  '/ugc_1.jpg',
  '/ugc_2.jpg',
  '/ugc_3.jpg',
  '/ugc_4.jpg',
];

function PdpUgc() {
  return (
    <section className="pdp-ugc-section">
      <div className="pdp-section-header center">
        <span className="pdp-eyebrow">Community</span>
        <h2 className="pdp-heading">How You Enjoy It</h2>
      </div>

      <div className="ugc-grid">
        {ugcImages.map((src, idx) => (
          <motion.div 
            key={idx}
            className="ugc-item"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            {/* Fallback to placeholders since images aren't real yet */}
            <div className="ugc-img-placeholder">
              <span>Customer Photo {idx + 1}</span>
            </div>
            <div className="ugc-hover-overlay">
              <button className="ugc-play-btn">▶ View Reel</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default PdpUgc;
