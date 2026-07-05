import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RecipePage.css';

const recipes = [
  {
    id: 1,
    title: 'Traditional Mango Pickle Making',
    productUsed: 'Mango Pickle',
    prepTime: '2 Weeks (Curing)',
    difficulty: 'Medium',
    image: '/making_mango.png',
    description: 'The authentic Bhojpur method of preparing our signature spicy, tangy raw mango pickle using hand-ground spices and pure mustard oil.',
    ingredients: [
      '1 kg Raw Green Mangoes (firm and sour)',
      '1/2 cup Mustard Oil (Kachi Ghani)',
      '1/4 cup Salt (non-iodized rock salt preferred)',
      '2 tbsp Turmeric Powder',
      '3 tbsp Kashmiri Red Chilli Powder',
      '1 tbsp Fenugreek Seeds (Methi)',
      '2 tbsp Fennel Seeds (Saunf)',
      '1 tbsp Mustard Seeds (Rai), coarsely ground',
      '1 tsp Nigella Seeds (Kalonji)'
    ],
    instructions: [
      'Wash the raw mangoes thoroughly and dry them completely. Cut them into medium-sized chunks with the skin on.',
      'In a large glass or ceramic bowl, mix the mango chunks with salt and turmeric. Cover and leave in the sun for 2 days until they release water and shrink slightly.',
      'Dry roast the fenugreek and fennel seeds lightly, then coarsely grind them along with the mustard seeds.',
      'Drain the excess water from the mangoes. Add the freshly ground spices, red chilli powder, and kalonji.',
      'Heat the mustard oil until it smokes, then let it cool completely. Pour the cooled oil over the spiced mangoes and mix well with a dry wooden spoon.',
      'Transfer the mixture into a clean, dry clay martaban or glass jar.',
      'Cover the mouth of the jar with a muslin cloth and leave it in direct sunlight for 10-14 days, stirring gently every alternate day.',
      'Once the skin softens and the oil floats to the top, your authentic Mango Pickle is ready to serve!'
    ]
  },
  {
    id: 2,
    title: 'Rustic Garlic Pickle Making',
    productUsed: 'Garlic Pickle',
    prepTime: '1 Week (Curing)',
    difficulty: 'Medium',
    image: '/making_garlic.png',
    description: 'A robust, pungent pickle made by infusing whole garlic cloves with rich spices and cold-pressed mustard oil.',
    ingredients: [
      '500g Fresh Garlic (peeled)',
      '1 cup Mustard Oil',
      '2 tbsp Yellow Mustard Seeds (crushed)',
      '1 tbsp Fennel Seeds (Saunf)',
      '1 tsp Fenugreek Seeds (Methi)',
      '2 tbsp Red Chilli Powder',
      '1 tbsp Turmeric Powder',
      '3 tbsp Salt',
      '1 tsp Hing (Asafoetida)',
      '2 tbsp White Vinegar (for preservation)'
    ],
    instructions: [
      'Ensure the peeled garlic cloves are completely dry. Spread them on a cloth in the sun for a few hours to remove any residual moisture.',
      'Dry roast the fennel and fenugreek seeds until aromatic. Coarsely grind them.',
      'Heat the mustard oil in a pan until it reaches smoking point, then turn off the heat and let it cool slightly.',
      'While the oil is warm, add hing, turmeric, and the peeled garlic cloves. Stir gently for 2 minutes.',
      'Add the crushed mustard seeds, ground roasted spices, red chilli powder, and salt. Mix thoroughly until the garlic is coated.',
      'Allow the mixture to cool completely, then stir in the white vinegar.',
      'Transfer to an airtight sterilized jar.',
      'Keep the jar in sunlight for 5-7 days. The garlic will soften and absorb the pungent, spicy flavors of the oil.'
    ]
  },
  {
    id: 3,
    title: 'Sun-Cured Lemon Pickle Making',
    productUsed: 'Lemon Pickle',
    prepTime: '3-4 Weeks (Curing)',
    difficulty: 'Easy',
    image: '/making_lemon.png',
    description: 'An oil-free, sweet and tangy pickle where fresh lemons are slow-cooked purely by the heat of the summer sun.',
    ingredients: [
      '1 kg Thin-skinned Yellow Lemons',
      '250g Sugar or Jaggery Powder',
      '1/2 cup Sea Salt or Rock Salt',
      '2 tbsp Roasted Cumin Powder',
      '1 tbsp Black Salt (Kala Namak)',
      '1 tbsp Ajwain (Carom Seeds)',
      '1 tbsp Kashmiri Red Chilli Powder'
    ],
    instructions: [
      'Wash the lemons and wipe them completely dry. Moisture is the enemy of this pickle.',
      'Cut each lemon into 4 or 8 pieces, removing the seeds as you go. Do not squeeze out the juice.',
      'In a large, dry glass or ceramic bowl, combine the lemon pieces with rock salt. Mix well.',
      'Transfer to a glass jar, cover with a cloth, and leave in the sun for 10-15 days. Shake the jar daily. The lemons will turn pale and soft.',
      'Once the lemon skin is tender, pour the mixture back into a bowl.',
      'Add the sugar/jaggery, black salt, roasted cumin powder, ajwain, and red chilli powder. Mix thoroughly until the sugar begins to dissolve in the lemon juice.',
      'Transfer back to the jar and place in the sun for another 7-10 days until the juices thicken into a syrupy consistency.',
      'Store in a cool, dry place. This pickle only gets better (and darker) with age!'
    ]
  },
  {
    id: 4,
    title: 'Stuffed Green Chilli Pickle Making',
    productUsed: 'Green Chilli Pickle',
    prepTime: '1 Week (Curing)',
    difficulty: 'Hard',
    image: '/making_chilli.png',
    description: 'The classic North Indian Hari Mirch ka Achaar, where long green chillies are meticulously stuffed with a tangy mustard filling.',
    ingredients: [
      '500g Long Green Chillies (thick variety, mild heat)',
      '1/2 cup Mustard Oil',
      '4 tbsp Yellow Mustard Seeds (Rai), finely ground',
      '2 tbsp Fennel Seeds (Saunf), coarsely ground',
      '1 tbsp Amchur (Dry Mango Powder)',
      '1 tsp Turmeric Powder',
      '2 tbsp Salt',
      '1 tsp Kalonji (Nigella Seeds)',
      '1 tbsp Lemon Juice'
    ],
    instructions: [
      'Wash the green chillies and dry them completely. Remove the crowns/stems.',
      'Make a single lengthwise slit in each chilli, ensuring you do not cut them all the way through.',
      'In a dry mixing bowl, combine the ground mustard seeds, ground fennel, amchur, turmeric, salt, and kalonji.',
      'Heat the mustard oil until smoking, let it cool completely. Add 2 tablespoons of this cooled oil and the lemon juice to the dry spice mix. Mix to form a crumbly, damp stuffing.',
      'Carefully open the slit of each chilli and stuff it generously with the spice mixture.',
      'Place the stuffed chillies tightly in a sterilized glass jar.',
      'Pour the remaining cooled mustard oil over the chillies in the jar.',
      'Keep the jar in the sun for 4-5 days. The chillies will soften slightly and soak up the tangy mustard flavors.'
    ]
  }
];

function RecipePage({ onNavigate }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="recipe-page-wrapper">
      
      {/* ════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════ */}
      <section className="recipe-hero">
        <div className="recipe-hero-banner">
          <div className="recipe-hero-bg" style={{ backgroundImage: 'url(/deal_scatter.png)' }} />
          <div className="recipe-hero-overlay" />
          <motion.div
            className="recipe-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="recipe-hero-title">Our Heritage <em>Recipes</em></h1>
            <p className="recipe-hero-subtitle">
              Step into our kitchen. Discover the traditional, generations-old recipes we use to handcraft every jar of Swadyum pickles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          RECIPES GRID
      ════════════════════════════════════════════ */}
      <section className="recipe-grid-section">
        <div className="recipe-grid-container">
          
          <div className="recipe-header">
            <span className="recipe-eyebrow">The Making Of</span>
            <h2 className="recipe-heading">How It's Formed</h2>
          </div>

          <div className="recipe-grid">
            {recipes.map((recipe, index) => {
              const isExpanded = expandedId === recipe.id;

              return (
                <motion.div 
                  layout
                  className={`recipe-card ${isExpanded ? 'expanded' : ''}`}
                  key={recipe.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.div layout className="recipe-card-img-wrap" onClick={() => toggleExpand(recipe.id)}>
                    <img src={recipe.image} alt={recipe.title} className="recipe-card-img" />
                    <div className="recipe-badge">{recipe.productUsed}</div>
                  </motion.div>
                  
                  <motion.div layout className="recipe-card-body">
                    <motion.div layout className="recipe-meta">
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {recipe.prepTime}
                      </span>
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        {recipe.difficulty}
                      </span>
                    </motion.div>
                    
                    <motion.h3 layout className="recipe-card-title">{recipe.title}</motion.h3>
                    <motion.p layout className="recipe-card-desc">{recipe.description}</motion.p>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          className="recipe-details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="recipe-ingredients">
                            <h4>Raw Ingredients</h4>
                            <ul>
                              {recipe.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="recipe-instructions">
                            <h4>Preparation Method</h4>
                            <ol>
                              {recipe.instructions.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          
                          <div className="recipe-cta-box">
                            <p className="recipe-cta-text">Taste the authenticity of this traditional recipe without the wait.</p>
                            <button className="recipe-shop-btn" onClick={() => onNavigate(`product-${recipe.productUsed.toLowerCase().replace(/ /g, '-')}`)}>
                              Bring {recipe.productUsed} Home
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!isExpanded && (
                      <motion.button 
                        layout
                        className="recipe-view-btn"
                        onClick={() => toggleExpand(recipe.id)}
                      >
                        View Preparation Method
                      </motion.button>
                    )}
                    {isExpanded && (
                      <motion.button 
                        layout
                        className="recipe-close-btn"
                        onClick={() => toggleExpand(recipe.id)}
                      >
                        Close Details
                      </motion.button>
                    )}

                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}

export default RecipePage;
