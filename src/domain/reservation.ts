export interface Reservation {
  id: string;
  productId: number;
  clientId: string;
  quantity: number;
  expiresAt: Date;
}
