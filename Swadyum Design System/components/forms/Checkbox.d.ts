import { ChangeEventHandler } from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: string;
}
