import React from 'react';

/**
 * Pill-shaped CTA button in three treatments: solid primary, outlined
 * secondary, and underlined text link. Matches the site's global
 * `.btn-primary` / `.btn-secondary` / `.btn-text` system.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  type = 'button',
}) {
  const pad = size === 'sm' ? '10px 24px' : size === 'lg' ? '18px 44px' : '16px 40px';
  const fontSize = size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)';

  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize,
    borderRadius: 'var(--radius-full)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all var(--duration-normal) var(--ease-out)`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    lineHeight: 1,
    border: 'none',
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    primary: {
      ...base,
      padding: pad,
      background: 'var(--color-primary)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(10,90,50,0.2)',
    },
    secondary: {
      ...base,
      padding: pad,
      background: 'transparent',
      color: 'var(--color-ink)',
      border: '2px solid var(--color-border)',
    },
    text: {
      ...base,
      padding: 0,
      background: 'none',
      color: 'var(--color-primary)',
      fontSize: 'var(--text-sm)',
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
    },
  };

  const hover = {
    primary: { background: 'var(--color-primary-dark)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(10,90,50,0.3)' },
    secondary: { background: 'var(--color-ink)', color: '#fff', borderColor: 'var(--color-ink)', transform: 'translateY(-2px)' },
    text: { color: 'var(--color-primary-dark)' },
  };

  const [isHover, setHover] = React.useState(false);
  const style = { ...variants[variant], ...(isHover && !disabled ? hover[variant] : {}) };

  return (
    <button
      type={type}
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}
