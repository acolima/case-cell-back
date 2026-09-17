export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  clientId: string;
  items: OrderItem[];
  total: number;
  status: "COMPLETED" | "CANCELED";
  idempotencyKey?: string;
  erpProtocol?: string;
  createdAt: Date;
}
