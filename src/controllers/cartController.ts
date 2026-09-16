import { Request, Response } from "express";
import { cartService } from "../services/cartService.js";
import { validationError } from "../utils/errorUtils.js";

async function reserve(req: Request, res: Response) {
  const { productId, clientId, quantity, action } = req.body;

  if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
    throw validationError("O campo 'clientId' deve ser uma string não vazia.");
  }

  const numericProductId = Number(productId);
  if (
    productId === undefined ||
    isNaN(numericProductId) ||
    numericProductId <= 0
  ) {
    throw validationError("O campo 'productId' deve ser um número positivo.");
  }

  const numericQuantity = Number(quantity);
  if (
    quantity === undefined ||
    isNaN(numericQuantity) ||
    numericQuantity === 0
  ) {
    throw validationError(
      "O campo 'quantity' deve ser um número maior que zero.",
    );
  }

  if (action && !["increase", "decrease", "set"].includes(action)) {
    throw validationError(
      "O campo 'action', se informado, deve ser 'increase', 'decrease' ou 'set'.",
    );
  }

  const reservation = await cartService.reserve(
    numericProductId,
    clientId.trim(),
    numericQuantity,
    action,
  );

  res.status(200).json(reservation);
}

async function cancel(req: Request, res: Response) {
  try {
    const { reservationId } = req.params;

    if (
      !reservationId ||
      typeof reservationId !== "string" ||
      reservationId.trim() === ""
    ) {
      throw validationError("O 'reservationId' deve ser uma string não vazia.");
    }

    const reservation = await cartService.cancel(reservationId.trim());
    res.json(reservation);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function getCart(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
      throw validationError("O 'clientId' deve ser uma string não vazia.");
    }

    const cart = await cartService.getByClientId(clientId.trim());
    res.json(cart);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export const cartController = {
  reserve,
  cancel,
  getCart,
};
