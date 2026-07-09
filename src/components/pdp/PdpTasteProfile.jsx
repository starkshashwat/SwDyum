import React from 'react';
import { motion } from 'framer-motion';
import './PdpTasteProfile.css';

const defaultFlavorMetrics = [
  { label: 'Spicy', level: 80 },
  { label: 'Tangy', level: 95 },
  { label: 'Oil Level', level: 60 },
  { label: 'Crunch', level: 70 },
];

const defaultPairings = [
  { name: 'Paratha', icon: '🫓' },
  { name: 'Dal Chawal', icon: '🍛' },
  { name: 'Litti Chokha', icon: '🔥' },
  { name: 'Khichdi', icon: '🍲' },
  { name: 'Poori', icon: '🥟' },
];

function PdpTasteProfile({ tasteProfile }) {
  const displayMetrics = tasteProfile?.metrics && tasteProfile.metrics.length > 0 ? tasteProfile.metrics : defaultFlavorMetrics;
  const displayPairings = tasteProfile?.pairings && tasteProfile.pairings.length > 0 ? tasteProfile.pairings : defaultPairings;

  return (
    <section className="pdp-taste-section">
      <div className="pdp-section-container pdp-taste-container">
        {/* Flavor Meter */}
        <motion.div
          className="flavor-meter-side"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="pdp-eyebrow">Taste Profile</span>
          <h2 className="pdp-heading">Bold & Balanced</h2>
          <p className="pdp-taste-sub">A symphony of tang, heat, and crunch — crafted to make every bite memorable.</p>
          <div className="flavor-bars">
            {displayMetrics.map((metric, idx) => (
              <div className="flavor-bar-wrap" key={idx}>
                <div className="flavor-label">{metric.label}</div>
                <div className="flavor-track">
                  <motion.div
                    className="flavor-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.level}%` }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 1, delay: idx * 0.15, ease: 'easeOut' }}
                  />
                </div>
                <div className="flavor-pct">{metric.level}%</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pairing Suggestions */}
        <motion.div
          className="pairing-side"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="pdp-eyebrow">Pairing Suggestions</span>
          <h2 className="pdp-heading">Perfect With</h2>
          <div className="pairing-grid">
            {displayPairings.map((pair, idx) => (
              <motion.div
                className="pairing-item"
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
              >
                <div className="pairing-icon">{pair.icon}</div>
                <div className="pairing-name">{pair.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PdpTasteProfile;
