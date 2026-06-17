import React, { useEffect, useRef } from 'react';
import './ProcessSection.css';

function ProcessSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 } // Trigger when 15% is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const steps = [
    {
      id: 'step-01',
      title: 'Handpicked Ingredients',
      desc: 'Only carefully selected fruits, spices, and natural ingredients make their way into every batch.',
      img: '/gal_cut.png',
      animationClass: 'anim-fade-up'
    },
    {
      id: 'step-02',
      title: 'Authentic Spice Blending',
      desc: 'Traditional spice combinations create the rich and distinctive flavor profile that defines Swadyum.',
      img: '/deal_scatter.png',
      animationClass: 'anim-rotate'
    },
    {
      id: 'step-03',
      title: 'Handcrafted Preparation',
      desc: 'Every batch is prepared carefully using methods inspired by generations of homemade pickle making.',
      img: '/gal_mix.png',
      animationClass: 'anim-reveal'
    },
    {
      id: 'step-04',
      title: 'Slow Natural Maturation',
      desc: 'Time allows flavors to deepen naturally, creating the bold taste and aroma of authentic homemade pickle.',
      img: '/banner.png', // Placeholder for Earthen Jars
      animationClass: 'anim-glow'
    },
    {
      id: 'step-05',
      title: 'Ready For Your Table',
      desc: 'Freshly packed and delivered so every jar reaches you with the same care used during preparation.',
      img: '/prod_mango.png',
      animationClass: 'anim-scale-in'
    }
  ];

  return (
    <section className="process-section" ref={sectionRef}>
      
      {/* Subtle Background Pattern Elements */}
      <div className="process-pattern p-pattern-1"></div>
      <div className="process-pattern p-pattern-2"></div>
      <div className="process-pattern p-pattern-3"></div>

      <div className="process-container">
        
        {/* Title Area */}
        <div className="process-header">
          <span className="section-subtitle">~ The Process ~</span>
          <h2 className="section-headline">
            Crafted Slowly.<br/>
            Enjoyed Deeply.
          </h2>
          <p className="process-subtext">
            Every jar follows a time-honored process designed<br/>
            to preserve authentic flavors, natural textures,<br/>
            and the rich heritage of traditional pickle making.
          </p>
        </div>

        {/* Process Journey */}
        <div className="process-journey">
          {/* Flowing Organic Path SVG */}
          <div className="process-path-container">
            <svg className="process-path" preserveAspectRatio="none" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* A flowing bezier curve connecting the 5 steps */}
              <path 
                d="M50 50 C 200 10, 300 90, 500 50 C 700 10, 800 90, 950 50" 
                stroke="var(--premium-gold)" 
                strokeWidth="2" 
                strokeDasharray="8 8"
                className="path-line"
              />
            </svg>
          </div>

          <div className="process-steps">
            {steps.map((step, index) => (
              <div className={`process-step step-${index + 1}`} key={step.id}>
                <div className={`process-step-img-container ${step.animationClass}`}>
                  <img src={step.img} alt={step.title} className="process-step-img" />
                </div>
                <div className="process-step-content">
                  <span className="process-step-num">0{index + 1}</span>
                  <h3 className="process-step-title">{step.title}</h3>
                  <p className="process-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium End Block */}
        <div className="process-end-block">
          <div className="gold-divider"></div>
          <p className="end-statement">
            No shortcuts.<br/>
            No artificial preservation.<br/>
            Just patience, tradition, and authentic flavor.
          </p>
        </div>

      </div>
    </section>
  );
}

export default ProcessSection;
