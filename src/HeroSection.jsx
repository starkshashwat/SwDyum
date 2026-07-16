import React, { useState, useEffect, useCallback } from 'react';
import './HeroSection.css';

const SLIDES = [
  {
    image: '/hero_banner.webp',
    headline: (
      <>
        The sun did <em>the work.</em><br />
        We just packed it.
      </>
    ),
    description:
      'Small batch, hand-packed Aam Ka Achaar — from Bihar\u2019s orchards straight to your kitchen.',
  },
  {
    image: '/process_suncured_1783263051169.webp',
    headline: (
      <>
        <em>&ldquo;Bihar&rsquo;s Achaar,</em><br />
        Packed for Your Table.&rdquo;
      </>
    ),
    description:
      'From Langda mangoes sourced directly from Bihar to your home — no preservatives, no compromise.',
  },
  {
    image: '/process_sourcing_1783263006944.webp',
    headline: (
      <>
        <em>&ldquo;Made the Way</em><br />
        Your Nani Made It.&rdquo;
      </>
    ),
    description:
      'No shortcuts. No additives. Just raw Langda mango, cold-pressed mustard oil, and cured with sun.',
  },
];

const INTERVAL = 4000;

function HeroSection({ onNavigate }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActive((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  const goTo = (i) => setActive(i);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section
      className="hero-section-v2"
      id="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="hero-banner-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide backgrounds */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`hero-banner-bg ${i === active ? 'hero-bg-active' : ''}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        ))}

        <div className="hero-banner-overlay" />

        {/* Slide content */}
        <div className="hero-banner-content">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`hero-text-block ${i === active ? 'hero-slide-active' : 'hero-slide-hidden'}`}
            >
              <h1 className="hero-v2-headline">{slide.headline}</h1>

              <p className="hero-v2-subtitle">{slide.description}</p>

              <div className="hero-v2-cta-group">
                <button
                  type="button"
                  className="hero-v2-cta-primary"
                  onClick={() => onNavigate && onNavigate('shop')}
                >
                  Shop Now
                </button>

                <button
                  type="button"
                  className="hero-v2-cta-secondary"
                  onClick={() => onNavigate && onNavigate('about')}
                >
                  Our Story <span className="arrow">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust footer — bottom bar with dark gradient backdrop */}
        <div className="hero-trust-footer">
          <div className="hero-trust-item">
            <img src="/fssai.png" alt="FSSAI" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
            <span>FSSAI Registered</span>
          </div>
          <div className="hero-trust-item">
            <span style={{ fontSize: '1.2em' }}>🏺</span>
            <span>Small Batch</span>
          </div>
          <div className="hero-trust-item">
            <span style={{ fontSize: '1.2em' }}>🚚</span>
            <span>Pan-India Shipping</span>
          </div>
        </div>
      </div>

      {/* Progress dots — moved outside the banner container */}
      <div className="hero-carousel-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSection;
