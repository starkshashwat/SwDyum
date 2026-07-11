import React from 'react';

/**
 * Category tile — image over a title/subtitle/arrow row, used on "Find Your
 * Favourite" grid.
 */
export function CategoryCard({ category, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transform: hover ? 'translateY(-4px)' : 'none',
        boxShadow: hover ? 'var(--shadow-lg)' : 'none',
        transition: 'all var(--duration-normal) var(--ease-out)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ height: 180, overflow: 'hidden' }}>
        <img src={category.image} alt={category.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hover ? 'scale(1.06)' : 'scale(1)', transition: 'transform var(--duration-slow) var(--ease-out)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--color-ink)' }}>{category.title}</h3>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>{category.subtitle}</span>
        </div>
        <span style={{ color: 'var(--color-primary)', transform: hover ? 'translateX(3px)' : 'none', transition: 'transform var(--duration-fast)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </div>
  );
}
