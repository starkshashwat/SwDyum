import React from 'react';
import './AboutPage.css';

function AboutPage({ onNavigate }) {
  const teamMembers = [
    {
      id: 1,
      name: 'The Founders',
      role: 'Swadyum Foods',
      desc: 'Dedicated to preserving ancestral Bihari cooking methods and supporting smallholder organic farms across Bihar.',
      image: '/team_founder.png'
    },
    {
      id: 2,
      name: 'Our Master Blenders',
      role: 'Spice Artisans',
      desc: 'With decades of spice chemistry experience, our team hand-selects every batch of mustard seed and fennel.',
      image: '/team_chef.png'
    },
    {
      id: 3,
      name: 'Our Sourcing Team',
      role: 'Farmer Liaisons',
      desc: 'Building direct partnerships with farmer cooperatives in Mithila and Champaran to source premium raw green mangoes.',
      image: '/team_farmer.png'
    }
  ];

  return (
    <div className="about-page-wrapper">
      
      {/* 1. HERO STORY */}
      <section className="about-hero-section" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/about_us.png')` }}>
        <div className="about-hero-container">
          <span className="about-hero-subtitle">~ Swadyum Story ~</span>
          <h1 className="about-hero-title">Preserving Bihar's Culinary Heritage</h1>
          <p className="about-hero-desc">How a humble grandmother's recipe grew into a luxury brand bringing pure, sun-cured comfort into modern kitchens.</p>
        </div>
      </section>

      {/* 2. FOUNDER STORY */}
      <section className="founder-story-section">
        <div className="founder-story-container">
          <div className="founder-grid">
            <div className="founder-img-box">
              <img src="/team_founder.png" alt="Swadyum Foods Team" className="founder-img" />
              <div className="founder-gold-border"></div>
            </div>
            <div className="founder-content">
              <span className="section-subtitle">~ The Vision ~</span>
              <h2 className="section-headline">A Message From Swadyum Foods</h2>
              <p className="founder-narrative">
                "Growing up in Patna, summers meant one thing: rooftops lined with linen sheets and rows of clay jars. Making achar wasn't a chore; it was a communal festival. Grandmothers, mothers, and daughters gathered, gossiped, and shared spice secrets under the summer sun. 
              </p>
              <p className="founder-narrative-sub">
                When we looked at store shelves today, we saw mass-produced, chemically-stabilized pickles that tasted like vinegar rather than heritage. Swadyum was born out of a simple promise: to restore the pure, sun-cured, oil-steeped comfort of home-cooked pickles to Indian tables."
              </p>
              <div className="signature-box">
                <span className="sig-name">Swadyum Foods</span>
                <span className="sig-title">Patna, Bihar — Since 2020</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW SWADYUM STARTED */}
      <section className="story-origin-section">
        <div className="origin-container">
          <div className="origin-header-centered">
            <span className="section-subtitle">~ Our Genesis ~</span>
            <h2 className="section-headline">From a Terrace in Patna to Jars of Gold</h2>
          </div>
          <div className="origin-columns">
            <div className="origin-col">
              <h3>2020: The First Batch</h3>
              <p>During the lockdowns of 2020, we shared jars of our grandmother's spiced mangoes with neighbors in Patna. The response was overwhelming; people didn't just love the taste, they felt connected to their childhood homes.</p>
            </div>
            <div className="origin-col">
              <h3>2022: Local Sourcing</h3>
              <p>We expanded our supply chains to work directly with organic mango orchards in Mithila and garlic farmers in the foothills of Bihar. By avoiding brokers, we ensured fair wages and sourced the absolute finest raw ingredients.</p>
            </div>
            <div className="origin-col">
              <h3>2024: Premium Storefront</h3>
              <p>Swadyum is now a premium food boutique shipping sun-cured heritage to families across India, proving that tradition and luxury can reside in a single jar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRADITIONAL FAMILY RECIPES */}
      <section className="traditional-recipes-section">
        <div className="recipes-container">
          <div className="recipes-split-grid">
            <div className="recipes-content">
              <span className="section-subtitle">~ Heritage Formulas ~</span>
              <h2 className="section-headline">The Spice Secrets of Earthen Jars</h2>
              <p>Our spice blends aren't bought pre-ground. We select raw seeds (saunf, ajwain, kalonji, mustard, fenugreek), dry-roast them on iron pans, and stone-grind them to preserve natural oils.</p>
              <ul className="recipes-bullets">
                <li><strong>Stone-Ground:</strong> Cold grinding prevents spice flavor degradation.</li>
                <li><strong>Cold-Pressed Mustard Oil:</strong> Only raw, unfiltered oil acts as our preservative.</li>
                <li><strong>Mithila Salt Curing:</strong> Raw mangoes are salted to naturally release moisture.</li>
              </ul>
            </div>
            <div className="recipes-image-box">
              <img src="/deal_scatter.png" alt="Spices and ingredients" className="recipes-img" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. MANUFACTURING PROCESS */}
      <section className="manufacturing-process-section">
        <div className="process-container">
          <div className="process-header-centered">
            <span className="section-subtitle">~ Our Method ~</span>
            <h2 className="section-headline">Slow Cured Under the Bihar Sun</h2>
          </div>

          <div className="process-timeline-cards">
            <div className="timeline-card">
              <div className="step-num">01</div>
              <h3>Sorting & Washing</h3>
              <p>Raw mangoes and garlic cloves are sorted by hand and washed in crystal clear spring water.</p>
            </div>
            <div className="timeline-card">
              <h3>Manual Slicing</h3>
              <div className="step-num">02</div>
              <p>Fruits are sliced precisely using traditional iron cutters to ensure texture consistency.</p>
            </div>
            <div className="timeline-card">
              <div className="step-num">03</div>
              <h3>Spice Steeping</h3>
              <p>Ingredients are coated in dry-roasted spices and left to sweat under shade.</p>
            </div>
            <div className="timeline-card">
              <h3>Jar Aging</h3>
              <div className="step-num">04</div>
              <p>Jars are filled with cold-pressed oil and lined up on open roofs to mature under the hot sun for forty days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. QUALITY PROMISE */}
      <section className="quality-promise-section">
        <div className="quality-container">
          <div className="quality-card-centered">
            <span className="section-subtitle">~ Our Commitment ~</span>
            <h2 className="section-headline">The Swadyum Purity Guarantee</h2>
            <div className="promises-grid">
              <div className="promise-box">
                <span className="pb-check">✓</span>
                <span>Zero Chemical Vinegar</span>
              </div>
              <div className="promise-box">
                <span className="pb-check">✓</span>
                <span>No Artificial Colorings</span>
              </div>
              <div className="promise-box">
                <span className="pb-check">✓</span>
                <span>Sourced from Certified Farms</span>
              </div>
              <div className="promise-box">
                <span className="pb-check">✓</span>
                <span>Glass/Ceramic Maturing Only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MISSION & VISION */}
      <section className="mission-vision-section">
        <div className="mission-container">
          <div className="mission-grid">
            <div className="mv-card">
              <span className="mv-icon">🎯</span>
              <h3>Our Mission</h3>
              <p>To uplift Bihari culinary traditions, preserve traditional culinary recipes, support local organic farming families, and reintroduce raw, authentic nutrition to modern urban households.</p>
            </div>
            <div className="mv-card">
              <span className="mv-icon">👁️</span>
              <h3>Our Vision</h3>
              <p>To establish Bihari heritage food as a global standard for gourmet quality, bringing pure, preservative-free aging techniques back to the center of dining culture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BIHAR HERITAGE SHOWCASE */}
      <section className="heritage-showcase-section">
        <div className="heritage-container">
          <div className="heritage-grid">
            <div className="heritage-image-wrapper">
              <img src="/about_us.png" alt="Bihar Culinary Heritage" className="heritage-img" />
            </div>
            <div className="heritage-content">
              <span className="section-subtitle">~ Cultural Roots ~</span>
              <h2 className="section-headline">Rooted in Mithila Traditional Art & Culture</h2>
              <p>
                Bihar's culinary heritage is closely linked to its lifestyle. Our packaging draws inspiration from Mithila painting motifs (Madhubani), celebrating sun, earth, fish, and harvest. By choosing Swadyum, you support local women artisans who paint our gift boxes, bringing Bihar's cultural soul straight to your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TEAM SECTION */}
      <section className="about-team-section">
        <div className="team-container-box">
          <div className="team-header-centered">
            <span className="section-subtitle">~ Master Artisans ~</span>
            <h2 className="section-headline">Meet Our Team</h2>
          </div>

          <div className="team-grid-cards">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card-info">
                <div className="team-img-wrapper">
                  <img src={member.image} alt={member.name} className="team-img-avatar" />
                </div>
                <h3 className="team-name">{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <p className="team-desc">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className="about-cta-section">
        <div className="about-cta-container">
          <span className="cta-subtitle">~ Bring Bihar Home ~</span>
          <h2>Taste the Pure Heritage</h2>
          <p>Every jar of Swadyum carries the warmth of the sun and the soul of Bihar's kitchens.</p>
          <button className="about-cta-btn" onClick={() => onNavigate('shop')}>Shop Collections</button>
        </div>
      </section>

    </div>
  );
}

export default AboutPage;
