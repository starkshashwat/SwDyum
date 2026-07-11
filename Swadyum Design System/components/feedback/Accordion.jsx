import React, { useState } from 'react';

/**
 * Single expand/collapse row — coupon field toggle, PDP FAQ.
 */
export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid var(--color-border-light)', fontFamily: 'var(--font-body)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--color-ink)',
        }}
      >
        <span>{title}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration-normal) var(--ease-out)', color: 'var(--color-primary)' }}>▼</span>
      </button>
      {open && <div style={{ paddingBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.7 }}>{children}</div>}
    </div>
  );
}
