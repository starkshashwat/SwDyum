import { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** px width of the dialog. @default 420 */
  width?: number;
}
