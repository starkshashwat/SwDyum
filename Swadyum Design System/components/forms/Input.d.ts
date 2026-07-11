import { ReactNode, ChangeEventHandler } from 'react';

export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** Static text before the field, e.g. a country-code flag. */
  prefix?: ReactNode;
  /** Element after the field, e.g. a round submit IconButton. */
  rightSlot?: ReactNode;
}
