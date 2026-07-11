export interface CategoryCardData {
  title: string;
  subtitle: string;
  image: string;
}

export interface CategoryCardProps {
  category: CategoryCardData;
  onOpen?: () => void;
}
