import React from 'react';
import './RecipePairingSection.css';

const pairings = [
  {
    id: 1,
    title: "Achar + Paratha",
    subtitle: "A Classic Breakfast Ritual",
    image: "/promo1.webp",
    description: "Flaky, layered whole wheat parathas served hot with melting butter and a generous side of Swadyum Mango Pickle. The tang of green mango cuts perfectly through the rich ghee.",
    recipe: {
      prepTime: "10 mins",
      difficulty: "Easy",
      ingredients: ["Fresh layered parathas", "Pure cow ghee", "Swadyum Mango Pickle", "Thick yogurt (optional)"],
      pairingTip: "Lightly mash the mango pickle into the paratha layers before rolling it up for the ultimate childhood nostalgia bite."
    },
    steam: true
  },
  {
    id: 2,
    title: "Achar + Dal Chawal",
    subtitle: "Generational Comfort Food",
    image: "/deal_scatter.webp",
    description: "Simple yellow toor dal and steamed basmati rice drizzled with hot ghee, elevated with a spoonful of Swadyum Garlic Pickle. Raw garlic notes unlock a punchy depth of flavor.",
    recipe: {
      prepTime: "20 mins",
      difficulty: "Simple",
      ingredients: ["Basmati rice", "Toor dal with hing-jeera tadka", "Swadyum Garlic Pickle", "Sliced raw onions"],
      pairingTip: "Mix the garlic pickle directly into the ghee-soaked dal chawal to let the warm temperature release the mustard oil aroma."
    },
    gheeDrizzle: true
  },
  {
    id: 3,
    title: "Achar + Litti Chokha",
    subtitle: "The Ultimate Bihari Feast",
    image: "/promo2.webp",
    description: "Traditional baked sattu-stuffed littis dipped in melted ghee, served with roasted eggplant chokha and Swadyum Stuffed Red Chili Pickle. A spicy, smoky masterclass.",
    recipe: {
      prepTime: "45 mins",
      difficulty: "Medium",
      ingredients: ["Sattu-stuffed wheat littis", "Smoky baingan-aloo chokha", "Swadyum Stuffed Red Chili Achar", "Melted pure ghee"],
      pairingTip: "Crack open the litti, pour a spoonful of warm ghee inside, and smear a small piece of red chili pickle pulp directly onto the chokha."
    },
    warmGlow: true
  }
];

function RecipePairingSection() {
  return (
    <section className="recipe-pairing-section" id="pairings">
      <div className="rp-container">
        
        {/* SECTION INTRO */}
        <div className="rp-intro">
          <span className="section-subtitle">~ Pair It Perfectly ~</span>
          <h2 className="section-headline">
            A Perfect Companion<br />
            For Every Meal
          </h2>
          <p className="rp-subtext">
            Discover classic pairings loved across generations and elevate everyday dining with authentic, homemade Swadyum flavors.
          </p>
        </div>

        {/* INTERACTIVE PAIRING CARDS */}
        <div className="rp-grid">
          {pairings.map((p) => (
            <div key={p.id} className="pairing-card">
              
              {/* Card visual display */}
              <div className="pairing-image-wrapper">
                <img src={p.image} alt={p.title} className="pairing-food-img" />
                <div className="pairing-img-overlay"></div>
                
                {/* 1. Animated steam rising vector for Paratha */}
                {p.steam && (
                  <div className="steam-container">
                    <svg className="steam-svg steam-1" viewBox="0 0 20 80" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 80 Q15 60 5 40 T10 0" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    </svg>
                    <svg className="steam-svg steam-2" viewBox="0 0 20 80" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 80 Q5 60 15 40 T10 0" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    </svg>
                    <svg className="steam-svg steam-3" viewBox="0 0 20 80" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 80 Q12 60 8 40 T10 0" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}

                {/* 2. Ghee Drizzle spice particles for Dal Chawal */}
                {p.gheeDrizzle && (
                  <div className="ghee-container">
                    <div className="spice-floater Floater-1"></div>
                    <div className="spice-floater Floater-2"></div>
                    <div className="spice-floater Floater-3"></div>
                  </div>
                )}

                {/* 3. Terracotta glow spotlight for Litti Chokha */}
                {p.warmGlow && (
                  <div className="terracotta-spotlight"></div>
                )}

                {/* Magazine header overlay on food image */}
                <div className="pairing-image-title-strip">
                  <span className="pairing-tag">{p.subtitle}</span>
                  <h3 className="pairing-card-title">{p.title}</h3>
                </div>

              </div>

              {/* Card Editorial & Expanding recipe booklet content */}
              <div className="pairing-content">
                <p className="pairing-card-desc">{p.description}</p>
                
                {/* Expandable Recipe Booklet (reveals details on card hover) */}
                <div className="recipe-details-booklet">
                  <div className="recipe-meta-row">
                    <span className="meta-badge">⏱️ {p.recipe.prepTime}</span>
                    <span className="meta-badge">🍳 {p.recipe.difficulty}</span>
                  </div>
                  
                  <div className="recipe-section">
                    <h5 className="recipe-section-title">Ingredients Pairing</h5>
                    <ul className="recipe-ingredients-list">
                      {p.recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="ingredient-li">
                          <span className="gold-bullet">•</span> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="recipe-section">
                    <h5 className="recipe-section-title">Grandmother's Pairing Tip</h5>
                    <p className="recipe-pairing-tip">{p.recipe.pairingTip}</p>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* BOTTOM BRAND CTA */}
        <div className="rp-collection-cta">
          <h3 className="cta-heading">Ready To Create Your Own Bihar Experience?</h3>
          <button className="cta-collection-btn">
            Explore Our Collection
            <svg className="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}

export default RecipePairingSection;
