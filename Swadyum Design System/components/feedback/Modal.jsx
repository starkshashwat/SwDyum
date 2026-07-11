import React from 'react';

/**
 * Centered overlay dialog shell — WhatsApp login, delivery-message confirm.
 */
export function Modal({ open, onClose, children, width = 420 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay-ink-40)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width,
          maxWidth: '90vw',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-xl)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        {children}
      </div>
    </div>
  );
}
