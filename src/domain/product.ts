export interface Product {
  id: number;
  name: string;
  model: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  tag?: string;
  color: string;
  createdAt: Date;
}
