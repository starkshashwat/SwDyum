import React from 'react';

/**
 * Current price + struck-through MRP, used in product cards and PDP.
 */
export function PriceBlock({ price, oldPrice, unit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', fontFamily: 'var(--font-body)' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink)' }}>₹{price}</span>
      {oldPrice && oldPrice > price && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-light)', textDecoration: 'line-through' }}>₹{oldPrice}</span>
      )}
      {unit && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>/ {unit}</span>}
    </div>
  );
}
