import React from 'react';

/**
 * Row of star glyphs (filled/outline) with an optional review count.
 */
export function StarRating({ rating, count, size = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(rating) ? 'var(--color-secondary)' : 'none'} stroke="var(--color-secondary)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      {typeof count === 'number' && (
        <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>({count})</span>
      )}
    </div>
  );
}
