import { randomUUID } from "crypto";
import { Reservation } from "../domain/reservation.js";

export interface CartItem {
  id: string;
  productId: number;
  quantity: number;
}

export interface ClientCart {
  clientId: string;
  items: CartItem[];
  expiresAt: Date;
  timer: NodeJS.Timeout;
}

const clientCarts = new Map<string, ClientCart>();

export function getReservedQuantity(productId: number): number {
  let total = 0;
  const now = new Date();

  for (const [clientId, cart] of clientCarts.entries()) {
    if (now > cart.expiresAt) {
      clearTimeout(cart.timer);
      clientCarts.delete(clientId);
      continue;
    }

    for (const item of cart.items) {
      if (item.productId === productId) {
        total += item.quantity;
      }
    }
  }

  return total;
}

export function getItemInClientCart(
  clientId: string,
  productId: number,
): CartItem | undefined {
  const cart = clientCarts.get(clientId);
  if (!cart) return undefined;

  const now = new Date();
  if (now > cart.expiresAt) {
    clearTimeout(cart.timer);
    clientCarts.delete(clientId);
    return undefined;
  }

  return cart.items.find((item) => item.productId === productId);
}

export function updateItemQuantity(
  clientId: string,
  productId: number,
  deltaQuantity: number,
  ttlMs: number,
  isAbsoluteSet: boolean = false,
): Reservation {
  let cart = clientCarts.get(clientId);
  const now = new Date();

  if (cart && now > cart.expiresAt) {
    clearTimeout(cart.timer);
    clientCarts.delete(clientId);
    cart = undefined;
  }

  if (cart) {
    clearTimeout(cart.timer);
  }

  const expiresAt = new Date(Date.now() + ttlMs);

  const timer = setTimeout(() => {
    clientCarts.delete(clientId);
    console.log(
      `Carrinho do cliente ${clientId} expirou. Todos os itens foram liberados.`,
    );
  }, ttlMs);

  if (!cart) {
    const initialQty = isAbsoluteSet ? deltaQuantity : deltaQuantity;
    if (initialQty <= 0) {
      clearTimeout(timer);
      throw new Error(
        "A quantidade inicial do produto deve ser maior que zero.",
      );
    }

    const newItem: CartItem = {
      id: randomUUID(),
      productId,
      quantity: initialQty,
    };

    cart = {
      clientId,
      items: [newItem],
      expiresAt,
      timer,
    };
    clientCarts.set(clientId, cart);

    return {
      id: newItem.id,
      productId,
      clientId,
      quantity: newItem.quantity,
      expiresAt,
    };
  }

  cart.expiresAt = expiresAt;
  cart.timer = timer;

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === productId,
  );

  if (existingItemIndex !== -1) {
    const existingItem = cart.items[existingItemIndex];
    const newQuantity = isAbsoluteSet
      ? deltaQuantity
      : existingItem.quantity + deltaQuantity;

    if (newQuantity <= 0) {
      cart.items.splice(existingItemIndex, 1);

      if (cart.items.length === 0) {
        clearTimeout(cart.timer);
        clientCarts.delete(clientId);
      }

      return {
        id: existingItem.id,
        productId,
        clientId,
        quantity: 0,
        expiresAt,
      };
    }

    existingItem.quantity = newQuantity;

    return {
      id: existingItem.id,
      productId,
      clientId,
      quantity: existingItem.quantity,
      expiresAt,
    };
  } else {
    const initialQty = deltaQuantity;
    if (initialQty <= 0) {
      throw new Error("O produto não está no carrinho para ser diminuído.");
    }

    const newItem: CartItem = {
      id: randomUUID(),
      productId,
      quantity: initialQty,
    };
    cart.items.push(newItem);

    return {
      id: newItem.id,
      productId,
      clientId,
      quantity: newItem.quantity,
      expiresAt,
    };
  }
}

export function deleteReservationItem(
  reservationId: string,
): Reservation | undefined {
  const now = new Date();

  for (const [clientId, cart] of clientCarts.entries()) {
    if (now > cart.expiresAt) {
      clearTimeout(cart.timer);
      clientCarts.delete(clientId);
      continue;
    }

    const itemIndex = cart.items.findIndex((item) => item.id === reservationId);
    if (itemIndex !== -1) {
      const [removedItem] = cart.items.splice(itemIndex, 1);

      if (cart.items.length === 0) {
        clearTimeout(cart.timer);
        clientCarts.delete(clientId);
      }

      return {
        id: removedItem.id,
        productId: removedItem.productId,
        clientId,
        quantity: removedItem.quantity,
        expiresAt: cart.expiresAt,
      };
    }
  }

  return undefined;
}

export function getClientReservations(clientId: string): Reservation[] {
  const cart = clientCarts.get(clientId);
  if (!cart) return [];

  const now = new Date();
  if (now > cart.expiresAt) {
    clearTimeout(cart.timer);
    clientCarts.delete(clientId);
    return [];
  }

  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    clientId: cart.clientId,
    quantity: item.quantity,
    expiresAt: cart.expiresAt,
  }));
}
