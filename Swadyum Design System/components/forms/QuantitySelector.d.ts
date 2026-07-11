export interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  /** Floor value. @default 1 */
  min?: number;
}
