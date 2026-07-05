import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './ProcessSection.css';

const steps = [
  {
    number: 1,
    title: 'Sourcing Fresh Ingredients',
    description:
      'Hand-picked raw mangoes, lemons, green chillies, and garlic are sourced directly from Bihar farms — ensuring peak freshness and flavour.',
    image: '/process_sourcing_1783263006944.png',
  },
  {
    number: 2,
    title: 'Traditional Spice Grinding',
    description:
      'Turmeric, fenugreek, mustard seeds, and red chilli are stone-ground using the age-old silbatta method for a rich, aromatic masala.',
    image: '/process_grinding_1783263018468.png',
  },
  {
    number: 3,
    title: 'Hand-Mixed in Mustard Oil',
    description:
      'Every ingredient is hand-mixed with raw cold-pressed mustard oil in brass vessels, infusing deep flavour into every bite.',
    image: '/process_mixing_1783263028798.png',
  },
  {
    number: 4,
    title: 'Aged in Clay Martabans',
    description:
      'The pickle is packed into handmade earthen martabans and left to mature — just as Bihari grandmothers have done for generations.',
    image: '/process_aging_1783263039730.png',
  },
  {
    number: 5,
    title: 'Sun-Cured & Sealed Fresh',
    description:
      'Each batch is sun-cured for 21 days under direct Bihar sunlight, then carefully sealed and packaged to preserve its authentic taste.',
    image: '/process_suncured_1783263051169.png',
  },
];

/* ─── Animated step card ─────────────────────────────────────────────────── */
const stepVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.12 + 0.1,
      duration: 0.45,
      type: 'spring',
      stiffness: 300,
      damping: 18,
    },
  }),
};

function ProcessSection() {
  const sectionRef = useRef(null);

  /* ─── Parallax via scroll progress ─── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Decorative elements move at different parallax speeds
  const branchY = useTransform(scrollYProgress, [0, 1], ['-8%', '12%']);
  const cowY = useTransform(scrollYProgress, [0, 1], ['15%', '-10%']);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-6%']);
  const timelineScale = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section className="process-v2" ref={sectionRef} id="our-process">
      <div className="process-v2-inner">
        {/* ════════════════════════════════════════════
            LEFT COLUMN — Decorative + Title
        ════════════════════════════════════════════ */}
        <div className="process-v2-left">
          {/* Branch + birds illustration (top-left) */}
          <motion.div
            className="process-decor-branch"
            style={{ y: branchY }}
          >
            <img
              src="/branch_birds.png"
              alt=""
              aria-hidden="true"
              className="decor-branch-img"
            />
          </motion.div>

          {/* Section title */}
          <motion.div
            className="process-v2-title-block"
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="process-v2-heading">
              The Traditional<br />
              Journey Of Our<br />
              <em>Pickle</em>
            </h2>
          </motion.div>

          {/* Cow illustration (bottom-left) */}
          <motion.div
            className="process-decor-cow"
            style={{ y: cowY }}
          >
            <img
              src="/desi_cow.png"
              alt=""
              aria-hidden="true"
              className="decor-cow-img"
            />
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT COLUMN — Timeline + Steps
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
                    <h3 className="process-step-title">{step.title}</h3>
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
