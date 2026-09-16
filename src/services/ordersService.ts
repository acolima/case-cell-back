import { randomUUID } from "crypto";
import { Order, OrderItem } from "../domain/order.js";
import { productsService } from "./productsService.js";
import { clearClientCart, getClientReservations } from "./reservationsState.js";
import { notFoundError } from "../utils/errorUtils.js";

const orders: Order[] = [];

async function checkout(clientId: string): Promise<Order> {
  const reservedItems = getClientReservations(clientId);

  if (!reservedItems || reservedItems.length === 0) {
    throw notFoundError("Carrinho vazio ou a reserva já expirou.");
  }

  const orderItems: OrderItem[] = [];
  let total = 0;

  for (const item of reservedItems) {
    const product = productsService.getById(item.productId);

    if (!product) {
      throw notFoundError(`Produto com ID ${item.productId} não encontrado.`);
    }

    const subtotal = product.price * item.quantity;
    total += subtotal;

    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: Number(subtotal.toFixed(2)),
    });
  }

  for (const item of reservedItems) {
    productsService.decreaseStock(item.productId, item.quantity);
  }

  clearClientCart(clientId);

  const newOrder: Order = {
    id: randomUUID(),
    clientId,
    items: orderItems,
    total: Number(total.toFixed(2)),
    status: "COMPLETED",
    createdAt: new Date(),
  };

  orders.push(newOrder);

  return newOrder;
}

async function getOrders(): Promise<Order[]> {
  return orders;
}

async function getOrdersByClientId(clientId: string): Promise<Order[]> {
  return orders.filter((order) => order.clientId === clientId);
}

export const ordersService = {
  checkout,
  getOrders,
  getOrdersByClientId,
};
