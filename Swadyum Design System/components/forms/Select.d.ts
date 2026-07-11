import { ChangeEventHandler } from 'react';

export interface SelectOption {
  key: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
}
