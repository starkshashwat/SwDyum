import React from 'react';

/**
 * Fixed-position success/info toast, auto-dismiss expected to be handled by
 * the caller.
 */
export function Toast({ message, icon, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--color-primary-dark)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: 'var(--shadow-lg)',
        zIndex: 9999,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
      }}
    >
      {icon}
      {message}
    </div>
  );
}
