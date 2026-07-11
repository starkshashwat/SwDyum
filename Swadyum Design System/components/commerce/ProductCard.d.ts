export interface ProductCardData {
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  tagline?: string;
  badge?: 'bestseller' | 'spicy' | 'new';
}

export interface ProductCardProps {
  product: ProductCardData;
  onOpen?: () => void;
  onAddToCart?: (product: ProductCardData) => void;
  /** Full-width featured treatment (first grid slot). @default false */
  featured?: boolean;
}
