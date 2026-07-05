import React from 'react';
import { motion } from 'framer-motion';
import './AboutPage.css';

const values = [
  {
    title: 'Authentic Bhojpur Recipes',
    desc: 'Straight from the heart of Ara, Bihar. We use generations-old traditional methods to bring you the truest flavors of our heritage.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )
  },
  {
    title: 'Premium Raw Ingredients',
    desc: 'No compromises. We source the finest green mangoes, raw garlic, and cold-pressed mustard oil directly from local farmers.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
      </svg>
    )
  },
  {
    title: 'Sun-Cured Perfection',
    desc: 'Slow-aged under the Bihar sun in traditional clay martabans. No artificial preservatives, no chemical vinegars.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    )
  },
  {
    title: 'Beyond Pickles',
    desc: 'We are curating the best of traditional Bihari cuisine. A luxury brand bringing pure, bold, and unapologetic local flavors to your table.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  }
];

function AboutPage({ onNavigate }) {
  return (
    <div className="about-page-v2">

      {/* ════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════ */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-bg" style={{ backgroundImage: 'url(/about_us.png)' }} />
          <div className="about-hero-overlay" />
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="about-hero-title">The Taste of <br/><em>Ara, Bhojpur</em></h1>
            <p className="about-hero-subtitle">
              Bold, authentic, and uncompromising traditional food from the heart of Bihar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BRAND STORY (SPLIT LAYOUT)
      ════════════════════════════════════════════ */}
      <section className="about-story">
        <div className="about-story-container">
          
          <div className="about-story-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <img src="/branch_birds.png" alt="Decorative branch" className="about-decor-branch" />
              <span className="about-eyebrow">Our Roots</span>
              <h2 className="about-heading">
                Pure Heritage.<br/>
                No Shortcuts.
              </h2>
            </motion.div>
          </div>

          <div className="about-story-right">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="about-story-text highlight">
                Swadyum was born in Ara, Bhojpur with a single mission: to deliver the absolute best of traditional Bihari cuisine to the world.
              </p>
              <p className="about-story-text">
                We don't do mass production. We don't use chemical vinegars or artificial preservatives. What we do is source the finest raw ingredients directly from local farmers, hand-blend our spices using stone grinders, and age our pickles in clay martabans under the fierce Bihar sun.
              </p>
              <p className="about-story-text">
                This isn't just about food; it's about curating a luxury culinary experience that stays fiercely loyal to its roots. From spicy mango achaar to premium heritage combos, Swadyum is the standard for authentic Bhojpur flavors.
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
          CORE VALUES (BENTO GRID)
      ════════════════════════════════════════════ */}
      <section className="about-values">
        <div className="about-values-container">
          <div className="about-values-header">
            <span className="about-eyebrow">The Swadyum Standard</span>
            <h2 className="about-heading">Why Choose Us?</h2>
          </div>

          <div className="about-values-grid">
            {values.map((val, i) => (
              <motion.div 
                className="about-value-card" 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="value-icon">{val.icon}</div>
                <h3 className="value-title">{val.title}</h3>
                <p className="value-desc">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════════════ */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <div className="about-cta-card">
            <div className="about-cta-img-side">
              <img src="/deal_scatter.png" alt="Swadyum pickles" className="about-cta-img" />
            </div>
            <div className="about-cta-content">
              <span className="about-cta-eyebrow">Experience Swadyum</span>
              <h2 className="about-cta-heading">Taste the Best of Bhojpur</h2>
              <p className="about-cta-desc">
                Elevate your meals with our premium, sun-cured pickles. Prepared traditionally, packaged luxuriously.
              </p>
              <button className="about-cta-btn" onClick={() => onNavigate('shop')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AboutPage;
