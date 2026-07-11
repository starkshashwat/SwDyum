import React from 'react';

/**
 * Centered eyebrow + title + optional subtitle — the standard section
 * header used before any product/category/story grid.
 */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div style={{ textAlign: align, fontFamily: 'var(--font-body)' }}>
      {eyebrow && (
        <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
          {eyebrow}
        </span>
      )}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.15, margin: '0 0 var(--space-4)' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-muted)', maxWidth: 600, margin: align === 'center' ? '0 auto' : 0, lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
