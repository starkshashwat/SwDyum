import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './SocialProofSection.css';

// Custom CountUp Component triggered on viewport intersection
function CountUp({ end, duration = 2.5 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp = null;
          // Extract numeric value and decimal indicator
          const targetNum = parseFloat(end.replace(/[^0-9.]/g, ''));
          const isDecimal = end.includes('.');
          
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
            
            // Ease out cubic progress curve
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * targetNum;
            
            if (isDecimal) {
              setCount(currentVal.toFixed(1));
            } else {
              setCount(Math.floor(currentVal).toLocaleString());
            }

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              // Lock to final formatting
              setCount(isDecimal ? targetNum.toFixed(1) : targetNum.toLocaleString());
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [end, duration, hasAnimated]);

  // Extract non-numeric suffix/prefix symbols (+, ★, %)
  const suffix = end.replace(/[0-9.]/g, '');

  return (
    <span ref={elementRef} className="counter-number">
      {count}{suffix}
    </span>
  );
}

// Testimonials details
const testimonials = [
  {
    id: 1,
    name: "Preeti Mishra",
    city: "Patna",
    avatar: "/team_chef.png",
    videoBg: "/gal_mix.png",
    quote: "“Tastes exactly like the achar my grandmother used to make. The mustard oil aroma is so pure!”"
  },
  {
    id: 2,
    name: "Anand Verma",
    city: "New Delhi",
    avatar: "/team_founder.png",
    videoBg: "/deal_scatter.png",
    quote: "“The stuffed red chili pickle is incredibly rich and full. Perfect with a warm paratha.”"
  },
  {
    id: 3,
    name: "Kiran Devi",
    city: "Ranchi",
    avatar: "/team_farmer.png",
    videoBg: "/about_us.png",
    quote: "“Authentic taste without any chemical preservatives. Swadyum is now a permanent part of our table.”"
  },
  {
    id: 4,
    name: "Rajesh Ranjan",
    city: "Bengaluru",
    avatar: "/team_chef.png",
    videoBg: "/gal_cut.png",
    quote: "“The mango pickle slices are firm, sun-dried, and seasoned perfectly. Bringing back childhood summer memories.”"
  }
];

// Reels details
const reels = [
  {
    id: 1,
    image: "/gal_mix.png",
    views: "14.8K",
    title: "Sun-drying in earthen courtyard jars ☀️"
  },
  {
    id: 2,
    image: "/gal_cut.png",
    views: "32.4K",
    title: "Artisanal slicing of freshly harvested mangoes 🔪"
  },
  {
    id: 3,
    image: "/deal_scatter.png",
    views: "9.6K",
    title: "Hand-grinding natural spices 🌾"
  },
  {
    id: 4,
    image: "/about_us.png",
    views: "21.5K",
    title: "Master blend preparation 👩‍🍳"
  }
];

function SocialProofSection() {
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  return (
    <section className="social-proof-section">
      
      <div className="sp-container">
        
        {/* SECTION INTRO */}
        <div className="sp-intro">
          <span className="section-subtitle">~ Loved by Thousands ~</span>
          <h2 className="section-headline">
            The Flavor Families<br />
            Keep Coming Back For
          </h2>
          <p className="sp-subtext">
            Authentic recipes, unforgettable taste, and a growing community of customers who call Swadyum a part of their dining table.
          </p>
        </div>

        {/* DRAGGABLE CAROUSEL FOR TESTIMONIALS */}
        <div className="sp-carousel-container">
          <span className="drag-helper-text">← Drag to scroll reviews →</span>
          <motion.div ref={carouselRef} className="sp-carousel" whileTap={{ cursor: "grabbing" }}>
            <motion.div 
              drag="x" 
              dragConstraints={{ right: 0, left: -width }} 
              className="sp-carousel-inner"
            >
              {testimonials.map((t) => (
                <div key={t.id} className="testimonial-card">
                  
                  {/* Customer video testimonial preview */}
                  <div className="card-video-preview">
                    <img src={t.videoBg} alt={`${t.name}'s testimonial video preview`} className="video-bg-img" />
                    <div className="video-overlay"></div>
                    
                    {/* Play Badge */}
                    <div className="video-play-badge">
                      <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="play-label">Play Review</span>
                    </div>
                  </div>

                  {/* Testimonial Quote details */}
                  <div className="card-review-content">
                    <blockquote className="review-quote">{t.quote}</blockquote>
                    
                    <div className="review-identity-row">
                      <div className="avatar-wrapper">
                        <img src={t.avatar} alt={t.name} />
                      </div>
                      <div className="identity-text">
                        <h4 className="customer-name">{t.name}</h4>
                        <span className="customer-city">{t.city} • Verified Customer</span>
                      </div>
                      <span className="star-rating">★★★★★</span>
                    </div>
                  </div>

                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ANIMATED COUNTERS / TRUST METRICS */}
        <div className="sp-trust-metrics">
          
          <div className="metric-box">
            <CountUp end="10000+" />
            <h4 className="metric-title">Happy Customers</h4>
            <p className="metric-desc">Celebrating traditional tastes</p>
          </div>

          <div className="metric-box">
            <CountUp end="4.9★" />
            <h4 className="metric-title">Average Rating</h4>
            <p className="metric-desc">Based on verified reviews</p>
          </div>

          <div className="metric-box">
            <CountUp end="95%" />
            <h4 className="metric-title">Repeat Orders</h4>
            <p className="metric-desc">Customers returning for more</p>
          </div>

          <div className="metric-box">
            <CountUp end="50000+" />
            <h4 className="metric-title">Jars Delivered</h4>
            <p className="metric-desc">Shipped with love across India</p>
          </div>

        </div>

        {/* INSTAGRAM REELS WALL */}
        <div className="sp-reels-section">
          <div className="reels-header">
            <span className="section-subtitle">~ Community Journal ~</span>
            <h2 className="section-headline">Moments From Our Instagram</h2>
          </div>
          
          <div className="reels-grid">
            {reels.map((r) => (
              <div key={r.id} className="reel-card">
                <div className="reel-image-wrapper">
                  <img src={r.image} alt={r.title} />
                  <div className="reel-overlay"></div>
                  
                  {/* Reel play and stats indicators */}
                  <div className="reel-indicators">
                    <span className="reel-views">
                      <svg className="reel-views-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      {r.views}
                    </span>
                    <div className="reel-play-circle">
                      <svg className="reel-play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="reel-details">
                  <span className="reel-tag">@Swadyum</span>
                  <p className="reel-caption">{r.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TRUST BAR: Scrolling Marquee */}
      <div className="sp-trust-marquee-bar">
        <div className="marquee-wrapper">
          <div className="marquee-content">
            <span>Verified Reviews • Real Families • Authentic Taste • Homemade Recipes • Traditional Bihar Heritage • </span>
            <span>Verified Reviews • Real Families • Authentic Taste • Homemade Recipes • Traditional Bihar Heritage • </span>
            <span>Verified Reviews • Real Families • Authentic Taste • Homemade Recipes • Traditional Bihar Heritage • </span>
            <span>Verified Reviews • Real Families • Authentic Taste • Homemade Recipes • Traditional Bihar Heritage • </span>
          </div>
        </div>
      </div>

    </section>
  );
}

export default SocialProofSection;
