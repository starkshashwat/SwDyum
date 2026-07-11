import { ReactNode } from 'react';

export interface BadgeProps {
  /** Color treatment. @default "bestseller" */
  tone?: 'bestseller' | 'spicy' | 'new';
  children: ReactNode;
}
