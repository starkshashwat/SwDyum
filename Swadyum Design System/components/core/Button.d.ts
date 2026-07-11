import { ReactNode } from 'react';

export interface ButtonProps {
  /** Visual treatment. @default "primary" */
  variant?: 'primary' | 'secondary' | 'text';
  /** Size preset. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}
