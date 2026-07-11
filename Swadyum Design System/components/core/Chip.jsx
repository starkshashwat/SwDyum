import React from 'react';

/**
 * Small inline icon+label chip — trust bar items, PDP benefit callouts.
 */
export function Chip({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)' }}>
      {icon && (
        <span style={{ color: 'var(--color-primary)', display: 'flex', flexShrink: 0 }}>{icon}</span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', fontWeight: 700 }}>{title}</strong>
        {subtitle && <small style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{subtitle}</small>}
      </span>
    </div>
  );
}
