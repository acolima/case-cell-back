import { randomUUID } from "crypto";
import { Order, OrderItem } from "../domain/order.js";
import { productsService } from "./productsService.js";
import { clearClientCart, getClientReservations } from "./reservationsState.js";
import { erpService } from "./erpService.js";
import { notFoundError, conflictError } from "../utils/errorUtils.js";

const orders: Order[] = [];

const idempotencyStore = new Map<string, Order>();
const inFlightRequests = new Set<string>();

export interface CheckoutOptions {
  idempotencyKey?: string;
  simulateErpError?: boolean;
  simulateErpDelayMs?: number;
}

async function checkout(
  clientId: string,
  options: CheckoutOptions = {},
): Promise<Order> {
  const { idempotencyKey, simulateErpError, simulateErpDelayMs } = options;

  if (idempotencyKey) {
    if (inFlightRequests.has(idempotencyKey)) {
      throw conflictError(
        "Um pedido com esta mesma chave de idempotência já está sendo processado. Aguarde.",
      );
    }

    const existingOrder = idempotencyStore.get(idempotencyKey);
    if (existingOrder) {
      console.log(
        `[Idempotency] Pedido já processado anteriormente para a chave: ${idempotencyKey}`,
      );
      return existingOrder;
    }

    inFlightRequests.add(idempotencyKey);
  }

  try {
    const reservedItems = getClientReservations(clientId);

    if (!reservedItems || reservedItems.length === 0) {
      throw notFoundError(
        "Não foi possível finalizar o pedido: o carrinho está vazio ou a reserva já expirou.",
      );
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

    total = Number(total.toFixed(2));

    const erpResult = await erpService.processOrderInErp(
      { clientId, total, itemCount: orderItems.length },
      { forceError: simulateErpError, delayMs: simulateErpDelayMs },
    );

    for (const item of reservedItems) {
      productsService.decreaseStock(item.productId, item.quantity);
    }

    clearClientCart(clientId);

    const newOrder: Order = {
      id: randomUUID(),
      clientId,
      items: orderItems,
      total,
      status: "COMPLETED",
      idempotencyKey,
      erpProtocol: erpResult.protocol,
      createdAt: new Date(),
    };

    orders.push(newOrder);

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, newOrder);
    }

    return newOrder;
  } finally {
    if (idempotencyKey) {
      inFlightRequests.delete(idempotencyKey);
    }
  }
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
