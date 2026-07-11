export interface PriceBlockProps {
  price: number;
  oldPrice?: number;
  /** Suffix like "250g" — used on PDP, not on grid cards. */
  unit?: string;
}
