import React from 'react';
import { motion } from 'framer-motion';
import './PdpProcessTimeline.css';

const steps = [
  { icon: '🌿', title: 'Harvest', desc: 'Sourced from local farms' },
  { icon: '🔪', title: 'Cut by Hand', desc: 'Meticulously prepped' },
  { icon: '🥣', title: 'Traditional Blend', desc: 'Aromatic spice mixing' },
  { icon: '☀️', title: 'Sun Cured', desc: 'Slow matured naturally' },
  { icon: '📦', title: 'Packed Fresh', desc: 'Sealed for goodness' },
  { icon: '🚚', title: 'Delivered', desc: 'Straight to your door' },
];

function PdpProcessTimeline() {
  return (
    <section className="pdp-process-section">
      <div className="pdp-section-header center">
        <span className="pdp-eyebrow">The Making Process</span>
        <h2 className="pdp-heading">Crafted With Patience</h2>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {steps.map((step, idx) => (
          <motion.div 
            className="timeline-item" 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            <div className="timeline-icon">{step.icon}</div>
            <div className="timeline-content">
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default PdpProcessTimeline;
