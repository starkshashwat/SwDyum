import React from 'react';
import { motion } from 'framer-motion';
import './CategoriesSection.css';

const categories = [
  { slug: 'mango-pickle', title: 'Mango Pickle', subtitle: 'The timeless favorite', image: '/cat_mango.png' },
  { slug: 'garlic-pickle', title: 'Garlic Pickle', subtitle: 'Bold & aromatic', image: '/cat_garlic.png' },
  { slug: 'lemon-pickle', title: 'Lemon Pickle', subtitle: 'Tangy & refreshing', image: '/prod_lemon.png' },
  { slug: 'green-chilli-pickle', title: 'Green Chilli', subtitle: 'For spice lovers', image: '/prod_chili.png' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

function CategoriesSection({ onNavigate }) {
  return (
    <section className="categories-section section-padding">
      <div className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">Explore by Flavour</span>
          <h2 className="section-title">Find Your Favourite</h2>
        </motion.div>

        <div className="cat-grid">
          {categories.map((cat, i) => (
            <motion.div
              className="cat-card"
              key={cat.slug}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              onClick={() => onNavigate && onNavigate(`category-${cat.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate(`category-${cat.slug}`); }}
              aria-label={`Browse ${cat.title}`}
            >
              <div className="cat-card-img-wrap">
                <img src={cat.image} alt={cat.title} className="cat-card-img" loading="lazy" />
              </div>
              <div className="cat-card-content">
                <h3 className="cat-card-title">{cat.title}</h3>
                <span className="cat-card-subtitle">{cat.subtitle}</span>
                <span className="cat-card-arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;
