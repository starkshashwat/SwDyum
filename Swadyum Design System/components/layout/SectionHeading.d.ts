import { ReactNode } from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  /** Pass JSX with an <em> to use the italic-emphasis pattern. */
  title: ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
}
