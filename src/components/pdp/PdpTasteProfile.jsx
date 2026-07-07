import React from 'react';
import { motion } from 'framer-motion';
import './PdpTasteProfile.css';

const flavorMetrics = [
  { label: 'Spicy', level: 80 },
  { label: 'Tangy', level: 95 },
  { label: 'Oil Level', level: 60 },
  { label: 'Crunch', level: 70 },
];

const pairings = [
  { name: 'Paratha', icon: '🫓' },
  { name: 'Dal Chawal', icon: '🍛' },
  { name: 'Litti Chokha', icon: '🔥' },
  { name: 'Khichdi', icon: '🍲' },
  { name: 'Poori', icon: '🥟' },
];

function PdpTasteProfile() {
  return (
    <section className="pdp-taste-section">
      <div className="pdp-section-container pdp-taste-container">
        
        {/* Flavor Meter */}
        <div className="flavor-meter-side">
          <span className="pdp-eyebrow">Taste Profile</span>
          <h2 className="pdp-heading">Bold & Balanced</h2>
          <div className="flavor-bars">
            {flavorMetrics.map((metric, idx) => (
              <div className="flavor-bar-wrap" key={idx}>
                <div className="flavor-label">{metric.label}</div>
                <div className="flavor-track">
                  <motion.div 
                    className="flavor-fill" 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.level}%` }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 1, delay: idx * 0.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pairing Suggestions */}
        <div className="pairing-side">
          <span className="pdp-eyebrow">Pairing Suggestions</span>
          <h2 className="pdp-heading">Perfect With</h2>
          <div className="pairing-grid">
            {pairings.map((pair, idx) => (
              <motion.div 
                className="pairing-item" 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="pairing-icon">{pair.icon}</div>
                <div className="pairing-name">{pair.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default PdpTasteProfile;
