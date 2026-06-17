import React from 'react';
import './TrustBar.css';

function TrustBar() {
  return (
    <div className="trust-bar-section">
      
      {/* Subtle background decorative motifs (3% opacity) */}
      <div className="trust-bar-bg-decor">
        {/* Madhubani border line */}
        <div className="trust-border-decor"></div>
        {/* Mustard seeds pattern background */}
        <svg className="trust-seed-svg" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          <circle cx="30" cy="8" r="1.2" fill="currentColor" />
          <circle cx="50" cy="12" r="1.5" fill="currentColor" />
          <circle cx="70" cy="6" r="1" fill="currentColor" />
          <circle cx="90" cy="10" r="1.3" fill="currentColor" />
        </svg>
      </div>

      <div className="trust-bar-container">
        
        {/* Item 01: 100% Natural */}
        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <svg className="trust-icon-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              {/* Leaf illustration */}
              <path d="M20 32 C20 32 32 24 32 14 C32 10 28 8 24 8 C18 8 20 16 20 16 C20 16 22 8 16 8 C12 8 8 10 8 14 C8 24 20 32 20 32 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 16 L20 32" fill="none" stroke="currentColor" strokeWidth="1.2" /> {/* Stem line */}
              <path d="M20 22 C23 20 25 18 27 18" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M20 26 C17 24 15 22 13 22" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div className="glow-circle"></div>
          </div>
          <span className="trust-text">100% Natural</span>
        </div>

        {/* Item 02: Homemade Recipe */}
        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <svg className="trust-icon-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              {/* Recipe Scroll illustration */}
              <path d="M12 10 L28 10 C32 10 32 14 28 16 L12 16 C8 16 8 10 12 10 Z" fill="none" stroke="currentColor" strokeWidth="1.8" /> {/* Rolled top */}
              <path d="M10 15 L10 28 C10 32 15 32 15 32 L27 32 C30 32 30 28 27 28 C24 28 25 32 25 32" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M30 14 L30 29" fill="none" stroke="currentColor" strokeWidth="1.8" />
              {/* Lines representing written recipe text */}
              <line x1="14" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 2" />
              <line x1="14" y1="24" x2="26" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 2" />
              <line x1="14" y1="28" x2="20" y2="28" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 2" />
            </svg>
            <div className="glow-circle"></div>
          </div>
          <span className="trust-text">Homemade Recipe</span>
        </div>

        {/* Item 03: No Preservatives */}
        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <svg className="trust-icon-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              {/* Natural Seal outline */}
              <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
              {/* Branch inside */}
              <path d="M16 25 Q20 22 24 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 20 Q24 20 23 18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M18 22 Q14 20 16 18" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <div className="glow-circle"></div>
          </div>
          <span className="trust-text">No Preservatives</span>
        </div>

        {/* Item 04: Bihar Inspired */}
        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <svg className="trust-icon-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              {/* Madhubani-inspired Sun symbol */}
              <circle cx="20" cy="20" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="20" cy="20" r="4" fill="currentColor" />
              {/* Sun rays */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 360) / 8;
                const rad = (angle * Math.PI) / 180;
                const x1 = 20 + 9 * Math.cos(rad);
                const y1 = 20 + 9 * Math.sin(rad);
                const x2 = 20 + 13 * Math.cos(rad);
                const y2 = 20 + 13 * Math.sin(rad);
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />
                );
              })}
            </svg>
            <div className="glow-circle"></div>
          </div>
          <span className="trust-text">Bihar Inspired</span>
        </div>

        {/* Item 05: Fast Delivery */}
        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <svg className="trust-icon-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              {/* Traditional wooden delivery cart sketch */}
              <path d="M8 20 L28 20 L32 14 L36 14" fill="none" stroke="currentColor" strokeWidth="1.8" /> {/* Frame / handle */}
              <path d="M12 20 L12 12 L26 12 L26 20" fill="none" stroke="currentColor" strokeWidth="1.5" /> {/* Cargo Box */}
              {/* Wheels */}
              <circle cx="16" cy="26" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="16" cy="26" r="1" fill="currentColor" />
              <circle cx="26" cy="26" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="26" cy="26" r="1" fill="currentColor" />
            </svg>
            <div className="glow-circle"></div>
          </div>
          <span className="trust-text">Fast Delivery</span>
        </div>

      </div>
    </div>
  );
}

export default TrustBar;
