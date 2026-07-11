import { ReactNode } from 'react';

export interface ToastProps {
  message: string;
  icon?: ReactNode;
  visible: boolean;
}
