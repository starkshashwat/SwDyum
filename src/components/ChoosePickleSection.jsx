import React from 'react';
import { motion } from 'framer-motion';
import './ChoosePickleSection.css';

const BENEFIT_CARDS = [
  {
    id: 'taste',
    label: 'Taste',
    title: 'Homemade-style mango bite',
    description: 'Raw Langda mango stays tangy and firm, with the mustard-oil punch people expect from real Bihari achaar.',
  },
  {
    id: 'daily',
    label: 'Use',
    title: 'Built for daily Indian meals',
    description: 'Strong enough for parathas, balanced enough for dal-chawal, curd rice, khichdi, and thali plates.',
  },
  {
    id: 'clean',
    label: 'Quality',
    title: 'No artificial preservatives',
    description: 'The flavour comes from mango, salt, spices, mustard oil, and slow curing, not artificial shortcuts.',
  },
  {
    id: 'confidence',
    label: 'Support',
    title: '3rd party lab tested',
    description: 'Food products are non-returnable, but damaged, leaked, or wrong orders are handled with photo proof.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ChoosePickleSection({ onNavigate }) {
  return (
    <section className="cps-section" id="choose-your-pickle">
      <div className="cps-container">
        <div className="cps-header">
          <span className="cps-kicker">First Jar Guide</span>
          <h2 className="cps-title">Why Start With Mango Pickle?</h2>
          <p className="cps-subtitle">
            One focused product, four reasons it is the right first buy for a new Swadyum customer.
          </p>
        </div>

        <motion.div
          className="cps-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {BENEFIT_CARDS.map((item, index) => (
            <motion.div
              key={item.id}
              className={`cps-card ${index === 0 ? 'cps-card-highlight' : ''}`}
              variants={cardVariants}
            >
              <div className="cps-card-top">
                <span className="cps-badge">{item.label}</span>
                <span className="cps-number">{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="cps-card-body">
                <h3 className="cps-product-title">{item.title}</h3>
                <p className="cps-description">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="cps-main-cta-wrap">
          <button
            type="button"
            className="cps-main-cta"
            onClick={() => onNavigate && onNavigate('product-mango-pickle')}
          >
            Buy Mango Pickle - ₹299
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
