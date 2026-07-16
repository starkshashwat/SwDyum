import React from 'react';
import { motion } from 'framer-motion';
import './AboutPage.css';

/* ─── Shared motion variants (respect prefers-reduced-motion via CSS + framer) ─── */
const easeOut = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut, delay: i * 0.08 },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easeOut } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut, delay: i * 0.08 },
  }),
};

/* ─── Content: Core Values (preserved + tightened from existing copy) ─── */
const values = [
  {
    title: 'Authentic Bhojpur Recipes',
    desc: 'Straight from the heart of Ara, Bihar. Generations-old methods bring you the truest flavors of our heritage.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Premium Raw Ingredients',
    desc: 'No compromises. We source the finest green mangoes, raw garlic, and cold-pressed Kachi Ghani mustard oil directly from local farmers.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    title: 'Sun-Cured Perfection',
    desc: 'Slow-aged under the Bihar sun in traditional clay martabans. No artificial preservatives, no chemical vinegars.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    title: 'Beyond Pickles',
    desc: 'We are curating the best of traditional Bihari cuisine — a luxury brand bringing pure, bold, unapologetic local flavors to your table.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

/* ─── Content: The Craft — process timeline (reuses existing process imagery) ─── */
const craftSteps = [
  {
    step: '01',
    title: 'Sourced from the Soil',
    desc: 'Raw Langda mangoes, fresh garlic, lemons and chillies — plucked green and delivered straight from local Bihar farms.',
    image: '/process_sourcing_1783263006944.webp',
    alt: 'Fresh raw ingredients sourced from local Bihar farms',
  },
  {
    step: '02',
    title: 'Stone-Ground Spice Blend',
    desc: 'Mustard, fenugreek, turmeric, nigella and chilli are hand-ground on stone to release a deep, aromatic achaari masala.',
    image: '/process_grinding_1783263018468.webp',
    alt: 'Spices being stone-ground into achaari masala',
  },
  {
    step: '03',
    title: 'Hand-Mixed in Kachi Ghani',
    desc: 'Every jar is hand-mixed in cold-pressed Kachi Ghani mustard oil and desi cow ghee for its unmistakable Bihari character.',
    image: '/process_mixing_1783263028798.webp',
    alt: 'Pickle being hand-mixed in cold-pressed mustard oil',
  },
  {
    step: '04',
    title: 'Sun-Cured in Clay Martabans',
    desc: 'The pickle rests and matures for days under the fierce Bihar sun in traditional clay martabans — no chemical vinegars, no shortcuts.',
    image: '/process_suncured_1783263051169.webp',
    alt: 'Pickle sun-curing in traditional clay martabans',
  },
  {
    step: '05',
    title: 'Packed Fresh & Sealed',
    desc: 'Each small batch is moisture-sealed and packed carefully to reach your kitchen full of flavour, exactly as it left ours.',
    image: '/process_aging_1783263039730.webp',
    alt: 'Finished pickle being packed and sealed fresh',
  },
];

/* ─── Content: Quality / Sourcing proof stats ─── */
const stats = [
  { value: '100%', label: 'Natural Ingredients' },
  { value: '0', label: 'Artificial Preservatives' },
  { value: '5', label: 'Sun-Cured Steps' },
  { value: '100+', label: 'Families Served' },
];

function AboutPage({ onNavigate }) {
  return (
    <div className="about-page-v2">
      {/* ════════════════════════════════════════════
          1. HERO — The Taste of Ara, Bhojpur
      ════════════════════════════════════════════ */}
      <section className="about-hero" aria-labelledby="about-hero-title">
        <div className="about-hero-inner">
          <div className="about-hero-bg" style={{ backgroundImage: 'url(/about_us.webp)' }} />
          <div className="about-hero-overlay" />
          <motion.div
            className="about-hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="about-hero-eyebrow">Our Story · Ara, Bhojpur</span>
            <h1 id="about-hero-title" className="about-hero-title">
              The Taste of <br />
              <em>Ara, Bhojpur</em>
            </h1>
            <p className="about-hero-subtitle">
              Bold, authentic, and uncompromising traditional food from the heart of Bihar —
              sun-cured the way it has been for generations.
            </p>
            <div className="about-hero-actions">
              <motion.button
                type="button"
                className="about-hero-btn about-hero-btn--primary"
                onClick={() => onNavigate('shop')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Shop the Collection
              </motion.button>
              <a className="about-hero-btn about-hero-btn--ghost" href="#our-roots">
                Read Our Story
              </a>
            </div>
          </motion.div>
          <div className="about-hero-scroll" aria-hidden="true">
            <span className="about-hero-scroll-line" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. ORIGIN / FOUNDER STORY (split, image left)
      ════════════════════════════════════════════ */}
      <section className="about-story" id="our-roots" aria-labelledby="about-story-title">
        <div className="about-story-container">
          <motion.div
            className="about-story-media"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scaleIn}
          >
            <img src="/making_mango.webp" alt="Raw mango being prepared for traditional sun-cured pickle" className="about-story-img" loading="lazy" />
            <div className="about-story-media-badge">
              <span className="about-story-media-badge-dot" aria-hidden="true" />
              Est. in Ara, Bhojpur
            </div>
          </motion.div>

          <div className="about-story-copy">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
            >
              <img src="/branch_birds.webp" alt="" className="about-decor-branch" aria-hidden="true" />
              <span className="about-eyebrow">Our Roots</span>
              <h2 id="about-story-title" className="about-heading">
                Pure Heritage.<br />
                No Shortcuts.
              </h2>
              <p className="about-story-text highlight">
                Swadyum was born in Ara, Bhojpur with a single mission: to deliver the absolute best
                of traditional Bihari cuisine to the world.
              </p>
              <p className="about-story-text">
                We don't do mass production. We don't use chemical vinegars or artificial
                preservatives. What we do is source the finest raw ingredients directly from local
                farmers, hand-blend our spices using stone grinders, and age our pickles in clay
                martabans under the fierce Bihar sun.
              </p>
              <p className="about-story-text">
                This isn't just about food; it's about curating a luxury culinary experience that
                stays fiercely loyal to its roots. From spicy mango achaar to premium heritage
                combos, Swadyum is the standard for authentic Bhojpur flavors.
              </p>
              <div className="about-signature">
                <strong>Swadyum Foods</strong>
                <span>Ara, Bhojpur, Bihar</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. MISSION / VALUES (bento grid)
      ════════════════════════════════════════════ */}
      <section className="about-values" aria-labelledby="about-values-title">
        <div className="about-values-container">
          <motion.div
            className="about-values-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="about-eyebrow">The Swadyum Standard</span>
            <h2 id="about-values-title" className="about-heading">Why Choose Us?</h2>
            <p className="about-values-lede">
              Four promises that hold every jar of Swadyum to a standard higher than the last.
            </p>
          </motion.div>

          <div className="about-values-grid">
            {values.map((val, i) => (
              <motion.article
                className="about-value-card"
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                whileHover={{ y: -6 }}
              >
                <div className="value-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
                <div className="value-icon">{val.icon}</div>
                <h3 className="value-title">{val.title}</h3>
                <p className="value-desc">{val.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. THE CRAFT / PROCESS TIMELINE
      ════════════════════════════════════════════ */}
      <section className="about-craft" aria-labelledby="about-craft-title">
        <div className="about-craft-container">
          <motion.div
            className="about-craft-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="about-eyebrow">The Craft</span>
            <h2 id="about-craft-title" className="about-heading">
              Made Slowly,<br />The Bihari Way
            </h2>
            <p className="about-craft-lede">
              Five traditional steps that turn raw soil and sun into a jar of authentic Bhojpur
              flavour — no factory, no shortcuts.
            </p>
          </motion.div>

          <ol className="about-craft-timeline" aria-label="The Swadyum craft process">
            {craftSteps.map((s, i) => (
              <motion.li
                key={s.step}
                className={`about-craft-step ${i % 2 === 1 ? 'about-craft-step--reverse' : ''}`}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
              >
                <div className="about-craft-step-media">
                  <img src={s.image} alt={s.alt} className="about-craft-step-img" loading="lazy" />
                </div>
                <div className="about-craft-step-copy">
                  <span className="about-craft-step-num" aria-hidden="true">{s.step}</span>
                  <h3 className="about-craft-step-title">{s.title}</h3>
                  <p className="about-craft-step-desc">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. QUALITY / SOURCING PROOF (stats + editorial image)
      ════════════════════════════════════════════ */}
      <section className="about-proof" aria-labelledby="about-proof-title">
        <div className="about-proof-container">
          <motion.div
            className="about-proof-copy"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <span className="about-eyebrow">Quality You Can Trust</span>
            <h2 id="about-proof-title" className="about-heading">
              No Preservatives.<br />Just Sun, Soil & Spice.
            </h2>
            <p className="about-proof-text">
              Every batch is lab-tested, moisture-sealed at source, and made in small kitchen batches
              — the same way a daadi would make achaar at home. We let salt, mustard oil and the sun
              do the preserving, exactly as tradition intended.
            </p>
            <ul className="about-proof-list">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                FSSAI licensed, lab-tested small batches
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                Sourced directly from local Bihar farmers
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                Cold-pressed Kachi Ghani mustard oil & desi cow ghee
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="about-proof-media"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scaleIn}
          >
            <img src="/editorial_spoon.webp" alt="Editorial close-up of Swadyum pickle on a spoon" className="about-proof-img" loading="lazy" />
            <img src="/desi_cow.webp" alt="Desi cow — source of the ghee used in Swadyum pickles" className="about-proof-img about-proof-img--small" loading="lazy" />
          </motion.div>
        </div>

        <motion.div
          className="about-proof-stats"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeIn}
          aria-label="Swadyum quality at a glance"
        >
          {stats.map((s, i) => (
            <motion.div key={s.label} className="about-proof-stat" custom={i} variants={fadeUp}>
              <span className="about-proof-stat-value">{s.value}</span>
              <span className="about-proof-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          6. CLOSING CTA
      ════════════════════════════════════════════ */}
      <section className="about-cta" aria-labelledby="about-cta-title">
        <div className="about-cta-inner">
          <div className="about-cta-card">
            <div className="about-cta-img-side">
              <img src="/deal_scatter.webp" alt="Swadyum pickles arranged together" className="about-cta-img" loading="lazy" />
            </div>
            <div className="about-cta-content">
              <span className="about-cta-eyebrow">Experience Swadyum</span>
              <h2 id="about-cta-title" className="about-cta-heading">Taste the Best of Bhojpur</h2>
              <p className="about-cta-desc">
                Elevate your meals with our premium, sun-cured pickles. Prepared traditionally,
                packaged luxuriously.
              </p>
              <div className="about-cta-actions">
                <motion.button
                  type="button"
                  className="about-cta-btn"
                  onClick={() => onNavigate('shop')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Shop the Collection
                </motion.button>
                <motion.button
                  type="button"
                  className="about-cta-btn about-cta-btn--ghost"
                  onClick={() => onNavigate('contact')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Talk to Us
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
