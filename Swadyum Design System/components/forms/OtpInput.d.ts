export interface OtpInputProps {
  /** Number of digit boxes. @default 6 */
  length?: number;
  value: string;
  onChange: (next: string) => void;
}
