import { Request, Response } from "express";
import { cartService } from "../services/cartService.js";
import { ValidationError } from "../errors/appErrors.js";
import { handleControllerError } from "../errors/errorHandler.js";

async function reserve(req: Request, res: Response) {
  try {
    const { productId, clientId, quantity, action } = req.body;

    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
      throw new ValidationError(
        "O campo 'clientId' deve ser uma string não vazia.",
      );
    }

    const numericProductId = Number(productId);
    if (
      productId === undefined ||
      isNaN(numericProductId) ||
      numericProductId <= 0
    ) {
      throw new ValidationError(
        "O campo 'productId' deve ser um número positivo.",
      );
    }

    const numericQuantity = Number(quantity);
    if (
      quantity === undefined ||
      isNaN(numericQuantity) ||
      numericQuantity === 0
    ) {
      throw new ValidationError(
        "O campo 'quantity' deve ser um número maior que zero.",
      );
    }

    if (action && !["increase", "decrease", "set"].includes(action)) {
      throw new ValidationError(
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
  } catch (error: any) {
    handleControllerError(res, error);
  }
}

async function cancel(req: Request, res: Response) {
  try {
    const { reservationId } = req.params;

    if (
      !reservationId ||
      typeof reservationId !== "string" ||
      reservationId.trim() === ""
    ) {
      throw new ValidationError(
        "O 'reservationId' deve ser uma string não vazia.",
      );
    }

    const reservation = await cartService.cancel(reservationId.trim());
    res.json(reservation);
  } catch (error: any) {
    handleControllerError(res, error);
  }
}

async function getCart(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
      throw new ValidationError("O 'clientId' deve ser uma string não vazia.");
    }

    const cart = await cartService.getByClientId(clientId.trim());
    res.json(cart);
  } catch (error: any) {
    handleControllerError(res, error);
  }
}

export const cartController = {
  reserve,
  cancel,
  getCart,
};
