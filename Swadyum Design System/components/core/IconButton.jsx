import React from 'react';

/**
 * Circular 44x44 icon button — header actions, footer socials, cart trigger.
 */
export function IconButton({ children, label, active = false, onClick, filled = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: filled ? '1px solid var(--color-border)' : 'none',
        background: filled
          ? (hover ? 'var(--color-primary)' : 'var(--color-cream)')
          : (hover ? 'rgba(10,90,50,0.08)' : 'none'),
        color: active ? 'var(--color-primary)' : (filled && hover ? '#fff' : 'var(--color-ink)'),
        borderRadius: filled ? '50%' : 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast)',
      }}
    >
      {children}
    </button>
  );
}
