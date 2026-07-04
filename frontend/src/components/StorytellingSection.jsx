import React, { useEffect, useRef } from 'react';
import './StorytellingSection.css';

function StorytellingSection() {
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
      { threshold: 0.2 } // Trigger when 20% of section is visible
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

  return (
    <section className="storytelling-section" ref={sectionRef}>
      
      {/* Subtle Background Pattern Elements */}
      <div className="madhubani-pattern pattern-top-left"></div>
      <div className="madhubani-pattern pattern-bottom-right"></div>

      <div className="story-container">
        
        {/* Left Side: Immersive Image */}
        <div className="story-image-side">
          <div className="image-wrapper">
            <img 
              src="/gal_mix.png" 
              alt="Traditional Bihari kitchen preparation" 
              className="story-hero-img"
            />
          </div>
        </div>

        {/* Right Side: Editorial Content */}
        <div className="story-content-side">
          <span className="section-subtitle">~ Our Heritage ~</span>
          
          <h2 className="section-headline">
            From Bihar's Kitchens<br/>
            To Your Family Table
          </h2>
          
          <div className="story-paragraphs">
            <p>
              For generations, pickle making has been more than<br/>
              a recipe in Bihar—it has been a family tradition.<br/>
              Every season brought fresh ingredients, every home<br/>
              had its own secret blend of spices, and every jar<br/>
              carried stories passed down through generations.
            </p>
            <p>
              Swadyum preserves that legacy by bringing authentic<br/>
              homemade flavors to modern families without<br/>
              compromising tradition.
            </p>
          </div>

          {/* Heritage Timeline */}
          <div className="heritage-timeline">
            <div className="timeline-line"></div>
            
            <div className="timeline-step">
              <div className="step-dot"></div>
              <div className="step-content">
                <span className="step-num">01</span>
                <h4 className="step-title">Traditional Recipes</h4>
                <p className="step-desc">Passed down generations</p>
              </div>
            </div>
            
            <div className="timeline-step">
              <div className="step-dot"></div>
              <div className="step-content">
                <span className="step-num">02</span>
                <h4 className="step-title">Handcrafted Preparation</h4>
                <p className="step-desc">Small batch artisanal</p>
              </div>
            </div>
            
            <div className="timeline-step">
              <div className="step-dot"></div>
              <div className="step-content">
                <span className="step-num">03</span>
                <h4 className="step-title">Slow Natural Maturation</h4>
                <p className="step-desc">Sun-dried perfection</p>
              </div>
            </div>
            
            <div className="timeline-step">
              <div className="step-dot"></div>
              <div className="step-content">
                <span className="step-num">04</span>
                <h4 className="step-title">Delivered Fresh</h4>
                <p className="step-desc">Straight to your table</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotional Closing Quote */}
      <div className="story-quote-wrapper">
        <h3 className="story-quote">
          “Some flavors are remembered.<br/>
          Others become family traditions.”
        </h3>
      </div>
      
    </section>
  );
}

export default StorytellingSection;
