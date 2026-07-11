import React from 'react';

const motifs = {
  lotus: (color) => (
    <>
      <line x1="0" y1="20" x2="320" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="480" y1="20" x2="800" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <ellipse cx="400" cy="20" rx="8" ry="6" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M392 20 C392 12, 400 6, 400 6 C400 6, 408 12, 408 20" stroke={color} strokeWidth="1" fill="none" />
    </>
  ),
  fish: (color) => (
    <>
      <line x1="0" y1="20" x2="310" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="490" y1="20" x2="800" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <path d="M340 20 C340 12, 360 8, 375 20 C360 32, 340 28, 340 20Z" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M460 20 C460 12, 440 8, 425 20 C440 32, 460 28, 460 20Z" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="400" cy="20" r="2.5" fill={color} opacity="0.5" />
    </>
  ),
  sun: (color) => (
    <>
      <line x1="0" y1="20" x2="360" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="440" y1="20" x2="800" y2="20" stroke={color} strokeWidth="1" opacity="0.3" />
      <circle cx="400" cy="20" r="8" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="400" cy="20" r="4" stroke={color} strokeWidth="0.8" fill="none" />
    </>
  ),
  floral: (color) => (
    <>
      <line x1="0" y1="20" x2="800" y2="20" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <circle cx="400" cy="20" r="5" stroke={color} strokeWidth="1" fill="none" />
      <circle cx="400" cy="20" r="2" fill={color} opacity="0.4" />
    </>
  ),
};

/**
 * Thin-line Madhubani (Mithila folk-art) motif — the brand's one section
 * divider flourish, ported from the site's own MadhubaniDivider component.
 */
export function Divider({ variant = 'floral', color = 'var(--color-primary)' }) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 'var(--space-2) var(--space-6)' }}>
      <svg viewBox="0 0 800 40" style={{ width: '100%', maxWidth: 600, height: 32 }} fill="none">
        {(motifs[variant] || motifs.floral)(color)}
      </svg>
    </div>
  );
}
