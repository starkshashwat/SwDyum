import React, { useState } from 'react';
import './BlogDetailsPage.css';

// Blog details database mapping slugs
const blogDetailsData = {
  "secrets-of-solar-curing": {
    title: "The Secrets of Solar Curing: How Grandmothers Crafted Pickles that Last Decades",
    category: "Pickle Knowledge",
    date: "June 14, 2026",
    readTime: "7 min read",
    image: "/about_us.png",
    author: {
      name: "Nora Bell",
      role: "Founder & Head Artisan",
      bio: "Nora has spent over twenty years archiving traditional culinary practices in Patna and Madhubani, bringing old-world science into the modern pantry.",
      image: "/team_founder.png"
    },
    toc: [
      { id: "intro", label: "Introduction to Solar Maturation" },
      { id: "earthen-jars", label: "Why Earthen Clay Jars Matter" },
      { id: "oil-preservative", label: "Cold-Pressed Mustard Oil Chemistry" },
      { id: "step-by-step", label: "Stepping Under the Sunlight" }
    ],
    content: [
      {
        sectionId: "intro",
        heading: "Introduction to Solar Maturation",
        paragraphs: [
          "Before the advent of modern chemical preservatives, commercial white vinegar, or refrigeration, preserving seasonal summer harvests was an elaborate science. Sun-curing (or 'Dhoop Dikhana' in Hindi) is a time-tested process that relies on solar heat to draw out moisture and allow raw spices and oils to mature together.",
          "By slow-heating raw green mangoes or garlic cloves inside glass or earthenware jars under direct sunlight, we slowly soften the fibers without breaking down nutritional values. The sun sterilizes the environment naturally, preventing microbial spoilage."
        ]
      },
      {
        sectionId: "earthen-jars",
        heading: "Why Earthen Clay Jars (Martabans) Matter",
        paragraphs: [
          "Traditionally, grandmothers matured pickles inside glazed earthen pots called Martabans. These vessels have micro-porous structures that allow pickles to 'breathe'. Unlike modern plastic containers which trap heat and cause condensation (leading to moisture spoilage), clay pots keep internal temperatures stable even in sweltering 42°C summer heat.",
          "The chemical stability of clay means no toxic chemicals leach into the pure oil and salt cure, maintaining taste integrity over years."
        ]
      },
      {
        sectionId: "oil-preservative",
        heading: "Cold-Pressed Mustard Oil Chemistry",
        paragraphs: [
          "Pure, cold-pressed mustard oil is the second pillar of traditional preservation. It forms a dense, hydrophobic layer on top of the pickles, blocking oxygen from reaching the raw ingredients. The allyl isothiocyanate naturally present in cold-pressed mustard seeds acts as a powerful antimicrobial agent."
        ]
      }
    ],
    recipe: {
      title: "How to Pair it: Classic Bihari Masala Puri",
      prep: "15 mins",
      cook: "10 mins",
      serves: "4 servings",
      ingredients: [
        "2 cups Whole wheat flour (Atta)",
        "1 tbsp Carom seeds (Ajwain)",
        "2 tbsp Cold-pressed mustard oil (for dough)",
        "1 tsp Turmeric and chili powder",
        "Water & Salt to knead",
        "Swadyum Mango or Stuffed Chili Achar (to pair)"
      ],
      steps: [
        "In a large bowl, combine wheat flour, ajwain, salt, spices, and 2 tbsp oil.",
        "Knead into a stiff, smooth dough using warm water. Rest for 10 minutes.",
        "Roll into small, even circular discs (puris).",
        "Heat mustard oil in a kadhai until smoking hot. Deep-fry the puris until golden brown and puffed.",
        "Serve hot immediately, accompanied by a generous spoonful of Swadyum Mango Pickle."
      ]
    },
    related: ["sattu-paratha-mango-pickle", "medicinal-garlic-winter"]
  },
  "sattu-paratha-mango-pickle": {
    title: "Sattu Paratha & Mango Pickle: The Traditional Bihar Breakfast Formula",
    category: "Recipes",
    date: "May 28, 2026",
    readTime: "5 min read",
    image: "/deal_scatter.png",
    author: {
      name: "Robert Leo",
      role: "Master Spice Blender",
      bio: "Robert specializes in regional Indian grains and spice pairings, focusing on unlocking clean, authentic nutrition.",
      image: "/team_chef.png"
    },
    toc: [
      { id: "warmth-flour", label: "The Warmth of Roasted Gram Flour" },
      { id: "tang-balance", label: "Balancing Flavors with Mango Achar" },
      { id: "paratha-recipe", label: "Traditional Sattu Paratha Recipe" }
    ],
    content: [
      {
        sectionId: "warmth-flour",
        heading: "The Warmth of Roasted Gram Flour",
        paragraphs: [
          "Sattu (roasted Bengal gram flour) is a powerhouse of protein and dietary fiber. In Bihari cuisine, it is seasoned with chopped onions, green chillies, lemon juice, and roasted cumin seeds. However, because sattu is dry and dense, eating flatbreads filled with it requires a high-moisture, high-tang companion."
        ]
      },
      {
        sectionId: "tang-balance",
        heading: "Balancing Flavors with Mango Achar",
        paragraphs: [
          "Our traditional family mango pickle provides the perfect acidic balance. The rich mustard oil coats the mouth, and the tang of raw mango cuts through the earthiness of sattu, creating an explosion of texture and savory contrast."
        ]
      }
    ],
    recipe: {
      title: "Traditional Bihar Sattu Paratha",
      prep: "20 mins",
      cook: "15 mins",
      serves: "3 servings",
      ingredients: [
        "1.5 cups Sattu (Roasted Gram Flour)",
        "1 finely chopped Onion",
        "2 chopped Green Chillies",
        "1 tbsp Ginger-garlic paste",
        "1 tbsp Lemon juice",
        "2 tbsp Swadyum Mango Achar Masala (with oil)",
        "Atta dough (standard kneaded wheat flour)"
      ],
      steps: [
        "In a bowl, mix sattu, chopped onions, chillies, ginger-garlic, lemon juice, salt, and the key secret: 2 tbsp of Swadyum pickle masala.",
        "Mix well, adding a splash of water if dry. The stuffing should hold its shape when pressed.",
        "Take a ball of Atta dough, roll it out slightly, place a spoonful of sattu filling in the center, and fold the edges to seal.",
        "Roll gently into a circular flatbread, making sure the stuffing doesn't escape.",
        "Cook on a hot tawa with a teaspoon of ghee until golden spots appear on both sides.",
        "Serve hot with cooling yogurt and extra Swadyum Mango Pickle."
      ]
    },
    related: ["secrets-of-solar-curing", "martabans-vs-glass"]
  }
};

function BlogDetailsPage({ blogSlug, onNavigate }) {
  const p = blogDetailsData[blogSlug] || blogDetailsData["secrets-of-solar-curing"];

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  const handleShare = (platform) => {
    alert(`Sharing this article on ${platform}!`);
  };

  return (
    <div className="blog-details-wrapper">
      
      {/* 1. HERO IMAGE BANNER */}
      <section className="article-hero-banner" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url(${p.image})` }}>
        <div className="article-hero-container">
          <span className="article-category-badge">{p.category}</span>
          <h1 className="article-hero-title">{p.title}</h1>
          <div className="article-meta-row">
            <span className="meta-author">By {p.author.name}</span>
            <span className="meta-divider">•</span>
            <span className="meta-date">{p.date}</span>
            <span className="meta-divider">•</span>
            <span className="meta-time">{p.readTime}</span>
          </div>
        </div>
      </section>

      {/* 2. ARTICLE LAYOUT CONTENT & SIDEBAR */}
      <section className="article-body-section">
        <div className="article-container">
          <div className="article-grid-layout">
            
            {/* Left Column: Table of Contents & Share Buttons */}
            <aside className="article-navigation-sidebar">
              <div className="toc-sticky-box">
                <h4>Table of Contents</h4>
                <ul className="toc-links-list">
                  {p.toc.map(item => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                  ))}
                  {p.recipe && (
                    <li>
                      <a href="#recipe-card">Recipe Pairing</a>
                    </li>
                  )}
                </ul>

                {/* Share Buttons */}
                <div className="article-share-widget">
                  <h4>Share Article</h4>
                  <div className="share-buttons-row">
                    <button className="share-btn" onClick={() => handleShare('WhatsApp')}>💬</button>
                    <button className="share-btn" onClick={() => handleShare('Instagram')}>📸</button>
                    <button className="share-btn" onClick={() => handleShare('Facebook')}>👤</button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Middle Column: Main Article Content */}
            <article className="article-main-content">
              {p.content.map((sec) => (
                <div key={sec.sectionId} id={sec.sectionId} className="article-content-block">
                  <h2>{sec.heading}</h2>
                  {sec.paragraphs.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>
              ))}

              {/* RECIPE CARD */}
              {p.recipe && (
                <div id="recipe-card" className="article-recipe-card">
                  <div className="recipe-card-header">
                    <span className="recipe-badge">Achar Recipe Pairing</span>
                    <h3>{p.recipe.title}</h3>
                    <div className="recipe-stats-row">
                      <span><strong>Prep:</strong> {p.recipe.prep}</span>
                      <span>•</span>
                      <span><strong>Cook:</strong> {p.recipe.cook}</span>
                      <span>•</span>
                      <span><strong>Serves:</strong> {p.recipe.serves}</span>
                    </div>
                  </div>

                  <div className="recipe-card-body">
                    <div className="recipe-ingredients">
                      <h4>Ingredients Needed</h4>
                      <ul>
                        {p.recipe.ingredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="recipe-steps">
                      <h4>Preparation Steps</h4>
                      <ol>
                        {p.recipe.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* AUTHOR BIO */}
              <div className="article-author-bio-card">
                <div className="author-bio-img-wrapper">
                  <img src={p.author.image} alt={p.author.name} />
                </div>
                <div className="author-bio-content">
                  <h4>About The Author</h4>
                  <h3>{p.author.name}</h3>
                  <span className="author-role">{p.author.role}</span>
                  <p>{p.author.bio}</p>
                </div>
              </div>

            </article>

          </div>
        </div>
      </section>

      {/* 3. RELATED ARTICLES GRID */}
      <section className="related-articles-section">
        <div className="related-articles-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ Keep Reading ~</span>
            <h2 className="section-headline">Related Chronicles</h2>
          </div>

          <div className="related-articles-grid-row">
            {p.related.map((slug) => {
              const rel = blogDetailsData[slug];
              if (!rel) return null;
              return (
                <div key={slug} className="rel-article-card" onClick={() => onNavigate('blog-' + slug)}>
                  <div className="rel-art-img-box">
                    <img src={rel.image} alt={rel.title} />
                  </div>
                  <div className="rel-art-content">
                    <span className="rel-art-cat">{rel.category}</span>
                    <h4>{rel.title}</h4>
                    <span className="rel-art-link">Read Post ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER CTA BLOCK */}
      <section className="details-newsletter-cta">
        <div className="newsletter-cta-container">
          <span className="newsletter-cta-subtitle">~ Swadyum Digest ~</span>
          <h2>Join the Heritage Circle</h2>
          <p>Get a digest of traditional spice recipes and solar maturation guides delivered twice a month.</p>
          
          {subscribed ? (
            <div className="details-subscribe-success">
              <span>✓</span> Subscribed successfully! Welcome to the family.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="details-newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="details-email-input"
                required
              />
              <button type="submit" className="details-subscribe-btn">Subscribe</button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}

export default BlogDetailsPage;
