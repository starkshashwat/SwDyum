import React from 'react';

/**
 * Text input on a soft cream fill, used standalone or inside an InputGroup
 * (e.g. newsletter signup, pincode checker, coupon code).
 */
export function Input({ type = 'text', placeholder, value, onChange, prefix, rightSlot }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-cream)',
        border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-full)',
        padding: '4px 4px 4px 18px',
        gap: 'var(--space-2)',
        transition: 'border-color var(--duration-fast)',
      }}
    >
      {prefix && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '10px 6px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-ink)',
        }}
      />
      {rightSlot}
    </div>
  );
}
