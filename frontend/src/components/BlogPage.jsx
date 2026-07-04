import React, { useState } from 'react';
import './BlogPage.css';

const blogArticles = [
  {
    slug: "secrets-of-solar-curing",
    title: "The Secrets of Solar Curing: How Grandmothers Crafted Pickles that Last Decades",
    category: "Pickle Knowledge",
    date: "June 14, 2026",
    readTime: "7 min read",
    image: "/about_us.png",
    summary: "Before refrigeration, sun-curing was the science of preservation. We detail the thermal properties of earthen clay pots and cold-pressed mustard oil maturation.",
    isFeatured: true
  },
  {
    slug: "sattu-paratha-mango-pickle",
    title: "Sattu Paratha & Mango Pickle: The Traditional Bihar Breakfast Formula",
    category: "Recipes",
    date: "May 28, 2026",
    readTime: "5 min read",
    image: "/deal_scatter.png",
    summary: "Why the dry roasted gram flour of Sattu paratha requires the moist, mustard oil tang of sun-dried mango pickles to unlock optimal flavor.",
    isFeatured: false
  },
  {
    slug: "medicinal-garlic-winter",
    title: "The Medicinal Alchemy of Garlic Pickle in Winter",
    category: "Health Benefits",
    date: "May 10, 2026",
    readTime: "6 min read",
    image: "/cat_garlic.png",
    summary: "From boosting immunity to aiding circulation, explore how cured garlic cloves steeped in spices become a powerhouse of health.",
    isFeatured: false
  },
  {
    slug: "mithila-art-motifs",
    title: "Mithila Painting Motifs: Art That Breathes on Swadyum Chests",
    category: "Regional Stories",
    date: "April 22, 2026",
    readTime: "8 min read",
    image: "/banner.png",
    summary: "Discover the heritage of Madhubani art, the women collectives painting our box panels, and the stories of sun and fish.",
    isFeatured: false
  },
  {
    slug: "martabans-vs-glass",
    title: "Why Earthen Martabans Outperform Modern Glass and Plastic",
    category: "Pickle Knowledge",
    date: "March 15, 2026",
    readTime: "5 min read",
    image: "/gal_mix.png",
    summary: "Clay jars are breathing vessels. We explore the porosity and temperature-regulation properties that allow traditional pickles to mature without vinegar.",
    isFeatured: false
  }
];

const categoriesList = ["All", "Recipes", "Health Benefits", "Traditional Foods", "Regional Stories", "Pickle Knowledge"];

function BlogPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("All");
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  // Filter posts
  const filteredArticles = activeTab === "All" 
    ? blogArticles 
    : blogArticles.filter(art => art.category === activeTab);

  // Separate featured article if any
  const featured = blogArticles.find(art => art.isFeatured);
  const latestList = filteredArticles.filter(art => art.slug !== (activeTab === "All" && featured ? featured.slug : ''));

  const popularPosts = [
    { slug: "secrets-of-solar-curing", title: "The Secrets of Solar Curing" },
    { slug: "sattu-paratha-mango-pickle", title: "Sattu Paratha & Mango Pickle Pairing" },
    { slug: "martabans-vs-glass", title: "Why Earthen Martabans Outperform Glass" }
  ];

  return (
    <div className="blog-page-wrapper">
      
      {/* 1. HERO BANNER */}
      <section className="blog-hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('/banner.png')` }}>
        <div className="blog-hero-container">
          <span className="blog-hero-subtitle">~ Swadyum Chronicles ~</span>
          <h1 className="blog-hero-title">Culinary Blog & Recipes</h1>
          <p className="blog-hero-desc">Diving into the history, science, health benefits, and regional recipes behind Bihar's traditional food culture.</p>
        </div>
      </section>

      {/* 2. CATEGORY TAB FILTER BAR */}
      <section className="blog-filter-bar-section">
        <div className="blog-filter-container">
          <div className="blog-category-tabs">
            {categoriesList.map(cat => (
              <button 
                key={cat} 
                className={`blog-tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: FEATURED + LATEST GRID */}
      <section className="blog-main-content-section">
        <div className="blog-main-container">
          <div className="blog-layout-split">
            
            {/* Left Column: Featured & Latest Grid */}
            <div className="blog-feed-column">
              
              {/* FEATURED ARTICLE (Only when on 'All' tab) */}
              {activeTab === "All" && featured && (
                <div className="featured-article-card" onClick={() => onNavigate('blog-' + featured.slug)}>
                  <div className="featured-img-box">
                    <img src={featured.image} alt={featured.title} className="featured-img" />
                    <span className="featured-badge">Featured Article</span>
                  </div>
                  <div className="featured-content">
                    <span className="blog-meta-tag">{featured.category}</span>
                    <h2 className="featured-title">{featured.title}</h2>
                    <p className="featured-summary">{featured.summary}</p>
                    <div className="featured-footer">
                      <span className="blog-date">{featured.date}</span>
                      <span className="blog-dot">•</span>
                      <span className="blog-time">{featured.readTime}</span>
                      <span className="read-more-link">Read Post ➔</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LATEST ARTICLES LIST GRID */}
              <div className="latest-articles-container">
                <h3 className="section-feed-title">{activeTab === "All" ? "Latest Chronicles" : `${activeTab} Articles`}</h3>
                <div className="latest-articles-grid">
                  {latestList.map(art => (
                    <div key={art.slug} className="blog-article-card" onClick={() => onNavigate('blog-' + art.slug)}>
                      <div className="article-img-box">
                        <img src={art.image} alt={art.title} className="article-img" />
                        <span className="article-cat-badge">{art.category}</span>
                      </div>
                      <div className="article-info">
                        <div className="article-meta-row">
                          <span className="blog-date">{art.date}</span>
                          <span className="blog-dot">•</span>
                          <span className="blog-time">{art.readTime}</span>
                        </div>
                        <h4 className="article-title">{art.title}</h4>
                        <p className="article-summary">{art.summary}</p>
                        <span className="article-link">Read Post ➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Sidebar (Popular Posts & Newsletter) */}
            <aside className="blog-sidebar-column">
              
              {/* Popular Posts */}
              <div className="sidebar-widget popular-widget">
                <h4 className="widget-title">Popular Articles</h4>
                <ul className="popular-posts-list">
                  {popularPosts.map(post => (
                    <li key={post.slug} onClick={() => onNavigate('blog-' + post.slug)}>
                      <span className="pp-star">✦</span>
                      <span className="pp-title">{post.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sidebar Newsletter Widget */}
              <div className="sidebar-widget newsletter-widget">
                <h4 className="widget-title">Chronicles Digest</h4>
                <p className="widget-newsletter-text">Subscribe to receive seasonal recipes, pickle-making science notes, and early batch alerts straight in your inbox.</p>
                
                {subscribed ? (
                  <div className="sidebar-subscribe-success">
                    <span>✓</span> Welcome to the Swadyum family!
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="sidebar-newsletter-form">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="widget-input"
                      required
                    />
                    <button type="submit" className="widget-submit-btn">Subscribe</button>
                  </form>
                )}
              </div>

            </aside>

          </div>
        </div>
      </section>

    </div>
  );
}

export default BlogPage;
