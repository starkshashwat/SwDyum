import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HeroSection.css';

const slides = [
  {
    id: 1,
    image: '/hero_banner.png',
    headline: (
      <>
        Taste the <em>Heritage.</em> Feel the <em>Tradition.</em>
      </>
    ),
    subtitle:
      'Swadyum pickles are slow-crafted in clay martabans using the traditional Bihari method — sun-cured spices, cold-pressed mustard oil, and authentic homemade taste.',
  },
  {
    id: 2,
    image: '/banner.png',
    headline: (
      <>
        Sun-Cured <em>Spices.</em> Timeless <em>Flavour.</em>
      </>
    ),
    subtitle:
      'Handcrafted in small batches with 100% organic spices, aged under the summer sun. No preservatives, no shortcuts — just the gold standard of Bihari pickles.',
  },
  {
    id: 3,
    image: '/editorial_spoon.png',
    headline: (
      <>
        From Our <em>Kitchen.</em> To Your <em>Table.</em>
      </>
    ),
    subtitle:
      'Every jar is a labour of love — passed down through generations, perfected by hand, and delivered fresh to your doorstep from the heartland of Bihar.',
  },
];

function HeroSection({ onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero-section-v2" id="hero">
      <div className="hero-banner-container">
        {/* Background images */}
        <AnimatePresence>
          <motion.div
            key={slides[currentSlide].id}
            className="hero-banner-bg"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>

        {/* Dark overlay for text readability */}
        <div className="hero-banner-overlay" />

        {/* Content */}
        <div className="hero-banner-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={slides[currentSlide].id}
              className="hero-text-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="hero-v2-headline">{slides[currentSlide].headline}</h1>
              <p className="hero-v2-subtitle">{slides[currentSlide].subtitle}</p>

              <div className="hero-v2-cta-group">
                <button
                  className="hero-v2-cta-primary"
                  onClick={() => onNavigate && onNavigate('shop')}
                >
                  Shop Now
                </button>
                <button
                  className="hero-v2-cta-secondary"
                  onClick={() => onNavigate && onNavigate('about')}
                >
                  Our Story
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Dots */}
        <div className="hero-carousel-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
