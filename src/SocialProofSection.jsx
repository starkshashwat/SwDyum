import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import './SocialProofSection.css';

function CountUp({ end, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp = null;
      const targetNum = parseFloat(end.toString().replace(/[^0-9.]/g, ''));
      const isDecimal = end.toString().includes('.');

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * targetNum;

        setCount(isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal));

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setCount(isDecimal ? targetNum.toFixed(1) : targetNum);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const testimonials = [
  {
    id: 1,
    name: "Preeti M.",
    location: "Patna",
    quote: "Tastes exactly like the achar my grandmother used to make. The mustard oil aroma is so pure and authentic!",
    rating: 5
  },
  {
    id: 2,
    name: "Anand V.",
    location: "New Delhi",
    quote: "The stuffed red chili pickle is incredibly rich and full. Perfect with a warm paratha. Definitely ordering again.",
    rating: 5
  },
  {
    id: 3,
    name: "Kiran D.",
    location: "Ranchi",
    quote: "Authentic taste without any chemical preservatives. Swadyum is now a permanent part of our dining table.",
    rating: 5
  },
  {
    id: 4,
    name: "Rajesh R.",
    location: "Bengaluru",
    quote: "The mango pickle slices are firm, sun-dried, and seasoned perfectly. Bringing back childhood summer memories.",
    rating: 5
  },
  {
    id: 5,
    name: "Neha S.",
    location: "Mumbai",
    quote: "Tried the Garlic pickle. Just the right amount of spice and tanginess. Best I've had outside of Bihar.",
    rating: 4
  }
];

function SocialProofSection() {
  const scrollRef = useRef(null);
  const controls = useAnimation();

  // Auto-scrolling logic for the marquee
  useEffect(() => {
    controls.start({
      x: "-50%",
      transition: {
        ease: "linear",
        duration: 30,
        repeat: Infinity,
      }
    });
  }, [controls]);

  // Duplicate testimonials for seamless looping
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="social-proof-section section-padding">
      <div className="section-container">

        <div className="sp-header text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-eyebrow">Real Reviews</span>
            <h2 className="section-title">Loved by <em>200+</em> Families Across India</h2>
          </motion.div>
        </div>

        {/* Animated Counters */}
        <div className="sp-metrics-grid">
          <motion.div className="sp-metric-box" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h3 className="sp-metric-number"><CountUp end="200" suffix="+" /></h3>
            <p className="sp-metric-label">Happy Families</p>
          </motion.div>
          <motion.div className="sp-metric-box" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 className="sp-metric-number"><CountUp end="4.9" suffix="★" /></h3>
            <p className="sp-metric-label">Average Rating</p>
          </motion.div>
          <motion.div className="sp-metric-box" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <h3 className="sp-metric-number"><CountUp end="500" suffix="+" /></h3>
            <p className="sp-metric-label">Jars Delivered</p>
          </motion.div>
          <motion.div className="sp-metric-box" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <h3 className="sp-metric-number"><CountUp end="15" suffix="+" /></h3>
            <p className="sp-metric-label">Cities Served</p>
          </motion.div>
        </div>

        {/* Testimonial Carousel */}
        <div className="sp-carousel-wrapper" ref={scrollRef}>
          <div className="sp-carousel-fade-left"></div>
          <div className="sp-carousel-fade-right"></div>

          <motion.div
            className="sp-carousel-track"
            animate={controls}
            onHoverStart={() => controls.stop()}
            onHoverEnd={() => controls.start({ x: "-50%", transition: { ease: "linear", duration: 30, repeat: Infinity } })}
          >
            {doubledTestimonials.map((t, idx) => (
              <div className="sp-testimonial-card" key={`${t.id}-${idx}`}>
                <div className="sp-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < t.rating ? 'var(--color-accent)' : 'none'} stroke={i < t.rating ? 'var(--color-accent)' : 'var(--color-muted)'} strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <blockquote className="sp-quote">"{t.quote}"</blockquote>
                <div className="sp-customer-info">
                  <div className="sp-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="sp-name">{t.name}</div>
                    <div className="sp-location">{t.location} • Verified Buyer</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default SocialProofSection;
