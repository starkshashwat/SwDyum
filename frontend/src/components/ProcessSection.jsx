import React from 'react';
import { motion } from 'framer-motion';
import './ProcessSection.css';

const processes = [
  {
    title: 'Sun-Cured for 21 Days',
    description: 'Each batch is aged under direct Bihar sunlight, developing deep flavors that no factory shortcut can replicate.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
  },
  {
    title: 'Traditional Clay Pots',
    description: 'Prepared and matured in handmade earthen martabans — the same method used by Bihari households for generations.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2h8l2 4H6l2-4z"/>
        <path d="M6 6c0 0-2 2-2 6s2 8 8 8 8-4 8-8-2-6-2-6"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    title: 'Cold-Pressed Mustard Oil',
    description: 'We use only raw, cold-pressed mustard oil sourced directly from Bihar farms — the heart of every authentic Bihari pickle.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
      </svg>
    ),
  },
  {
    title: '100% Organic Spices',
    description: 'Turmeric, fenugreek, fennel, and mustard seeds — all sourced from trusted local farmers, free of chemicals and additives.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.8 11-10 11z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

function ProcessSection() {
  return (
    <section className="process-section section-padding">
      <div className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">Our Process</span>
          <h2 className="section-title">Why Swadyum?</h2>
          <p className="section-subtitle-text">
            Every jar carries centuries of Bihari tradition — no shortcuts, no compromises.
          </p>
        </motion.div>

        <div className="process-grid">
          {processes.map((item, i) => (
            <motion.div
              className="process-card"
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="process-icon-wrapper">
                {item.icon}
              </div>
              <h3 className="process-card-title">{item.title}</h3>
              <p className="process-card-desc">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;
