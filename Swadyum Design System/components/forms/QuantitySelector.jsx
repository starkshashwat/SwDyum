import React from 'react';

/**
 * Minus/count/plus stepper — PDP and cart line-item quantity control.
 */
export function QuantitySelector({ value, onChange, min = 1 }) {
  return (
    <div
      role="group"
      aria-label="Quantity"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        padding: '6px 6px',
      }}
    >
      <button
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={btnStyle}
      >
        −
      </button>
      <span aria-live="polite" style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, color: 'var(--color-ink)' }}>{value}</span>
      <button
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        style={btnStyle}
      >
        +
      </button>
    </div>
  );
}

const btnStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: 'none',
  background: 'var(--color-cream)',
  color: 'var(--color-ink)',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
