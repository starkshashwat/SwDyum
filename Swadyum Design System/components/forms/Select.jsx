import React from 'react';

/**
 * Native-feeling dropdown for sort/filter controls (shop toolbar).
 */
export function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--color-ink)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        cursor: 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt.key} value={opt.key}>{opt.label}</option>
      ))}
    </select>
  );
}
