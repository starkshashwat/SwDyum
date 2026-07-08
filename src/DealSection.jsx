import React, { useState, useEffect } from 'react';
import './DealSection.css';

function DealSection() {
  // Simple countdown logic for visual purposes
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="deal-section">
      <div className="deal-container">
        
        {/* Left Side: Content & Timer */}
        <div className="deal-content">
          <span className="section-subtitle">~ Best Deals of the Week ~</span>
          <h2 className="section-headline">Grab the best offer<br/>of this week!</h2>
          
          <div className="countdown-timer">
            <div className="time-block">
              <div className="time-value">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="time-label">Hours</div>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <div className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="time-label">Minutes</div>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <div className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="time-label">Seconds</div>
            </div>
          </div>
          
          <button className="primary-cta deal-btn">Shop Now</button>
        </div>

        {/* Right Side: Image with badges */}
        <div className="deal-image-side">
          <div className="deal-image-wrapper">
            <img src="/deal_scatter.webp" alt="Fresh Ingredients" className="deal-img" />
            
            {/* Badges pointing to image */}
            <div className="floating-badge badge-1">
              <span className="badge-text">100%<br/>Organic</span>
              <svg className="badge-arrow arrow-1" viewBox="0 0 100 100" fill="none">
                <path d="M10,90 Q50,90 90,10" stroke="var(--primary-green)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              </svg>
            </div>

            <div className="floating-badge badge-2">
              <span className="badge-text">Fresh Food</span>
              <svg className="badge-arrow arrow-2" viewBox="0 0 100 100" fill="none">
                <path d="M90,90 Q50,90 10,10" stroke="var(--mango-accent)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* SVG Marker for arrows */}
      <svg width="0" height="0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary-green)" />
          </marker>
        </defs>
      </svg>
    </section>
  );
}

export default DealSection;
