import React from 'react';
import { motion } from 'framer-motion';
import './PdpIngredients.css';

const defaultIngredients = [
  { name: 'Raw Mango', img: '/cat_mango.png', benefit: 'Hand-plucked tender mangoes loaded with Vitamin C for natural tanginess.' },
  { name: 'Mustard Oil', img: '/process_mixing_1783263028798.png', benefit: 'Cold-pressed Kachi Ghani oil preserving pungent aroma and healthy fats.' },
  { name: 'Fennel (Saunf)', img: '/cat_spices.png', benefit: 'Aids digestion and provides a sweet, aromatic undertone.' },
  { name: 'Turmeric', img: '/process_grinding_1783263018468.png', benefit: 'High in curcumin for immunity and a vibrant golden hue.' },
  { name: 'Red Chili', img: '/making_chilli.png', benefit: 'Sun-dried Mathania chilies for deep color and authentic heat.' },
];

function PdpIngredients({ ingredients = [] }) {
  const displayIngredients = ingredients && ingredients.length > 0 ? ingredients : defaultIngredients;

  return (
    <section className="pdp-ingredients-section">
      <div className="pdp-ingredients-container">
        <div className="pdp-section-header center">
          <span className="pdp-eyebrow">The Secret</span>
          <h2 className="pdp-heading">Pure Ingredients</h2>
          <p className="pdp-subtext">No preservatives, no synthetic colors. Just the wholesome goodness of nature.</p>
        </div>
        
        <div className="pdp-ingredients-grid">
          {displayIngredients.map((ing, idx) => (
            <motion.div 
              key={idx} 
              className="pdp-ingredient-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="ing-img-wrap">
                <img src={ing.img} alt={ing.name} />
              </div>
              <div className="ing-info">
                <h4>{ing.name}</h4>
                <div className="ing-hover-content">
                  <p>{ing.benefit}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PdpIngredients;
