export interface StarRatingProps {
  /** 0-5, rounded to nearest whole star for fill. */
  rating: number;
  count?: number;
  /** Star glyph size in px. @default 14 */
  size?: number;
}
