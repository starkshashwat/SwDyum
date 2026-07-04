import React from 'react';
import './madhubani-dividers.css';

/**
 * Madhubani-inspired SVG line art section dividers.
 * Variants: 'lotus', 'fish', 'sun', 'floral'
 * Used sparingly between sections to add cultural authenticity.
 */
function MadhubaniDivider({ variant = 'floral', color }) {
  const strokeColor = color || 'var(--color-chili)';

  const motifs = {
    /* Simple lotus-inspired symmetrical border */
    lotus: (
      <svg viewBox="0 0 800 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="madhubani-svg" aria-hidden="true">
        <line x1="0" y1="20" x2="320" y2="20" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        <line x1="480" y1="20" x2="800" y2="20" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        {/* Center lotus */}
        <ellipse cx="400" cy="20" rx="8" ry="6" stroke={strokeColor} strokeWidth="1.2" fill="none" />
        <path d="M392 20 C392 12, 400 6, 400 6 C400 6, 408 12, 408 20" stroke={strokeColor} strokeWidth="1" fill="none" />
        <path d="M388 20 C388 10, 400 2, 400 2 C400 2, 412 10, 412 20" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* Side dots */}
        <circle cx="330" cy="20" r="2" fill={strokeColor} opacity="0.4" />
        <circle cx="340" cy="20" r="1.5" fill={strokeColor} opacity="0.3" />
        <circle cx="470" cy="20" r="2" fill={strokeColor} opacity="0.4" />
        <circle cx="460" cy="20" r="1.5" fill={strokeColor} opacity="0.3" />
      </svg>
    ),

    /* Pair of fish facing each other — classic Mithila/Madhubani motif */
    fish: (
      <svg viewBox="0 0 800 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="madhubani-svg" aria-hidden="true">
        <line x1="0" y1="20" x2="310" y2="20" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        <line x1="490" y1="20" x2="800" y2="20" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        {/* Left fish → */}
        <path d="M340 20 C340 12, 360 8, 375 20 C360 32, 340 28, 340 20Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
        <path d="M330 20 L340 14 L340 26Z" stroke={strokeColor} strokeWidth="1" fill="none" />
        <circle cx="365" cy="18" r="1.5" fill={strokeColor} />
        {/* Right fish ← */}
        <path d="M460 20 C460 12, 440 8, 425 20 C440 32, 460 28, 460 20Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
        <path d="M470 20 L460 14 L460 26Z" stroke={strokeColor} strokeWidth="1" fill="none" />
        <circle cx="435" cy="18" r="1.5" fill={strokeColor} />
        {/* Center dot */}
        <circle cx="400" cy="20" r="2.5" fill={strokeColor} opacity="0.5" />
      </svg>
    ),

    /* Sun burst — another classic Madhubani motif */
    sun: (
      <svg viewBox="0 0 800 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="madhubani-svg" aria-hidden="true">
        <line x1="0" y1="20" x2="360" y2="20" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        <line x1="440" y1="20" x2="800" y2="20" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        {/* Center sun */}
        <circle cx="400" cy="20" r="8" stroke={strokeColor} strokeWidth="1.2" fill="none" />
        <circle cx="400" cy="20" r="4" stroke={strokeColor} strokeWidth="0.8" fill="none" />
        {/* Rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 400 + Math.cos(rad) * 10;
          const y1 = 20 + Math.sin(rad) * 10;
          const x2 = 400 + Math.cos(rad) * 16;
          const y2 = 20 + Math.sin(rad) * 16;
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth="1" opacity="0.6" />;
        })}
      </svg>
    ),

    /* Simple floral/botanical vine border */
    floral: (
      <svg viewBox="0 0 800 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="madhubani-svg" aria-hidden="true">
        <line x1="0" y1="20" x2="800" y2="20" stroke={strokeColor} strokeWidth="0.5" opacity="0.2" />
        {/* Left leaf cluster */}
        <path d="M350 20 Q360 10 370 20 Q360 30 350 20Z" stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M330 20 Q340 12 350 20 Q340 28 330 20Z" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.3" />
        {/* Center bloom */}
        <circle cx="400" cy="20" r="5" stroke={strokeColor} strokeWidth="1" fill="none" />
        <circle cx="400" cy="20" r="2" fill={strokeColor} opacity="0.4" />
        <path d="M400 13 Q405 16 400 20 Q395 16 400 13Z" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M400 27 Q405 24 400 20 Q395 24 400 27Z" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M393 20 Q396 15 400 20 Q396 25 393 20Z" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M407 20 Q404 15 400 20 Q404 25 407 20Z" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.6" />
        {/* Right leaf cluster */}
        <path d="M450 20 Q440 10 430 20 Q440 30 450 20Z" stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M470 20 Q460 12 450 20 Q460 28 470 20Z" stroke={strokeColor} strokeWidth="0.8" fill="none" opacity="0.3" />
      </svg>
    ),
  };

  return (
    <div className="madhubani-divider">
      {motifs[variant] || motifs.floral}
    </div>
  );
}

export default MadhubaniDivider;
