import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './ProcessSection.css';

const steps = [
  {
    number: 1,
    title: 'Fresh ingredients',
    description: 'We source raw mangoes, chillies, lemons, and garlic for every batch.',
    image: '/process_sourcing_1783263006944.webp',
    icon: null
  },
  {
    number: 2,
    title: 'Traditional spice blend',
    description: 'Mustard, fenugreek, turmeric, and chilli are ground for a deep, aromatic masala.',
    image: '/process_grinding_1783263018468.webp',
    icon: null
  },
  {
    number: 3,
    title: 'Cold-pressed mustard oil',
    description: 'Every jar is hand-mixed in mustard oil for its unmistakable Bihari character.',
    image: '/process_mixing_1783263028798.webp',
    icon: null
  },
  {
    number: 4,
    title: 'Matured for flavour',
    description: 'The pickle rests and develops flavour before packing.',
    image: '/process_aging_1783263039730.webp',
    icon: null
  },
  {
    number: 5,
    title: 'Packed fresh',
    description: 'Each batch is sealed carefully to reach your kitchen full of flavour.',
    image: '/process_suncured_1783263051169.webp',
    icon: null
  },
];

/* ─── Animated step card ─────────────────────────────────────────────────── */
const stepVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1 + 0.05,
      duration: 0.4,
      type: 'spring',
      stiffness: 280,
      damping: 18,
    },
  }),
};

function ProcessSection() {
  const sectionRef = useRef(null);

  /* ─── Scroll Progress ─── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-4%']);
  const timelineScale = useTransform(scrollYProgress, [0, 0.35], [0, 1]);

  return (
    <section className="process-v2" ref={sectionRef} id="our-process">
      <div className="process-v2-inner">
        {/* ════════════════════════════════════════════
            LEFT COLUMN — Title & Heritage Proof Card
        ════════════════════════════════════════════ */}
        <div className="process-v2-left">
          {/* Section Kicker & Heading */}
          <motion.div
            className="process-v2-title-block"
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="process-kicker">Authentic Heritage</span>
            <h2 className="process-v2-heading">
              Made Slowly,<br />The Bihari Way
            </h2>
            <p className="process-v2-subtext">
              Five traditional steps that preserve authentic regional flavor without artificial shortcuts.
            </p>
          </motion.div>

          {/* Real Proof & Heritage Card */}
          <motion.div
            className="process-proof-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="proof-card-badge">
              <span className="proof-pulse" />
              Real Evidence Guarantee
            </div>
            <h4 className="proof-card-title">Crafted in Small Batches in Ara, Bihar</h4>
            <ul className="proof-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4E28" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span>100% Sun-Cured</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4E28" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Cold-Pressed Mustard Oil Only</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4E28" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span>No Artificial Preservatives</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT COLUMN — Dotted Timeline + Step Cards
        ════════════════════════════════════════════ */}
        <div className="process-v2-right">
          {/* Dotted timeline line */}
          <div className="process-timeline-line">
            <motion.div
              className="process-timeline-fill"
              style={{ scaleY: timelineScale }}
            />
          </div>

          {/* Steps */}
          <div className="process-steps-list">
            {steps.map((step, i) => (
              <div className="process-step-row" key={step.number}>
                {/* Number bubble */}
                <motion.div
                  className="process-step-number"
                  custom={i}
                  variants={numberVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  {step.number}
                </motion.div>

                {/* Step card */}
                <motion.div
                  className="process-step-card"
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  <div className="process-step-img-wrap">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="process-step-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="process-step-text">
                    <div className="process-step-title-row">
                      {step.icon && <div className="process-step-icon">{step.icon}</div>}
                      <h3 className="process-step-title">{step.title}</h3>
                    </div>
                    <p className="process-step-desc">{step.description}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;
