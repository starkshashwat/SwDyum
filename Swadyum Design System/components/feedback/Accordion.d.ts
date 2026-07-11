import { ReactNode } from 'react';

export interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}
