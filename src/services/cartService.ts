import { Reservation } from "../domain/reservation.js";
import { productsService } from "./productsService.js";
import {
  getReservedQuantity,
  getItemInClientCart,
  updateItemQuantity,
  deleteReservationItem,
  getClientReservations,
} from "./reservationsState.js";
import { conflictError, notFoundError } from "../utils/errorUtils.js";

const RESERVATION_TTL_MS = 10 * 60 * 1000;

async function reserve(
  productId: number,
  clientId: string,
  quantity: number,
  action?: "increase" | "decrease" | "set",
): Promise<Reservation> {
  const product = productsService.getById(productId);

  if (!product) {
    throw notFoundError(`Produto com ID ${productId} não encontrado.`);
  }

  const existingItem = getItemInClientCart(clientId, productId);
  const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

  let delta = quantity;
  let isAbsolute = false;

  if (action === "decrease") {
    delta = -Math.abs(quantity);
  } else if (action === "increase") {
    delta = Math.abs(quantity);
  } else if (action === "set") {
    isAbsolute = true;
    delta = quantity - currentQuantityInCart;
  }

  if (delta > 0) {
    const totalReserved = getReservedQuantity(productId);
    const availableInStock = product.quantity - totalReserved;

    if (delta > availableInStock) {
      throw conflictError(
        `Estoque insuficiente para o produto "${product.name}". Disponível no momento: ${availableInStock}, solicitado adicional: ${delta}.`,
      );
    }
  }

  if (delta < 0 && currentQuantityInCart === 0) {
    throw conflictError(
      `O produto "${product.name}" não está no carrinho para ter a quantidade reduzida.`,
    );
  }

  return updateItemQuantity(
    clientId,
    productId,
    isAbsolute ? quantity : delta,
    RESERVATION_TTL_MS,
    isAbsolute,
  );
}

async function cancel(reservationId: string): Promise<Reservation> {
  const reservation = deleteReservationItem(reservationId);

  if (!reservation) {
    throw notFoundError(
      `Reserva "${reservationId}" não encontrada ou já expirou.`,
    );
  }

  return reservation;
}

async function getByClientId(clientId: string): Promise<Reservation[]> {
  return getClientReservations(clientId);
}

export const cartService = {
  reserve,
  cancel,
  getByClientId,
};
