import React, { useRef } from 'react';

/**
 * 6-box OTP entry — WhatsApp login modal, step 2.
 */
export function OtpInput({ length = 6, value, onChange }) {
  const refs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const setDigit = (i, d) => {
    if (d && isNaN(d)) return;
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(''));
    if (d && refs.current[i + 1]) refs.current[i + 1].focus();
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          maxLength={1}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && refs.current[i - 1]) refs.current[i - 1].focus();
          }}
          style={{
            width: 44,
            height: 52,
            textAlign: 'center',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
          }}
        />
      ))}
    </div>
  );
}
