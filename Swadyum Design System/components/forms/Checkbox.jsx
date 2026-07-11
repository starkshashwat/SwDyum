import React from 'react';

/**
 * Custom checkbox with a rounded box — WhatsApp opt-in, review form.
 */
export function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          marginTop: 1,
          borderRadius: 6,
          border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: checked ? 'var(--color-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--duration-fast)',
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>{label}</span>
    </label>
  );
}
