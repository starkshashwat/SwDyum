import React from 'react';

/**
 * Small pill label overlaid on product imagery — bestseller / spicy / new.
 */
export function Badge({ tone = 'bestseller', children }) {
  const bg = {
    bestseller: 'var(--color-primary)',
    spicy: 'var(--color-accent)',
    new: 'var(--color-secondary)',
  }[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        background: bg,
        color: '#fff',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </span>
  );
}
