import { ReactNode } from 'react';

export interface IconButtonProps {
  /** SVG icon, 20-22px, stroke=currentColor */
  children: ReactNode;
  label: string;
  active?: boolean;
  filled?: boolean;
  onClick?: () => void;
}
