import { Request, Response } from "express";
import { cartService } from "../services/cartService.js";

async function reserve(req: Request, res: Response) {
  const { productId, clientId, quantity, action } = req.body;

  try {
    const reservation = await cartService.reserve(
      Number(productId),
      clientId,
      Number(quantity),
      action,
    );
    res.status(200).json(reservation);
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
}

async function cancel(req: Request, res: Response) {
  const { reservationId } = req.params;

  try {
    const reservation = await cartService.cancel(reservationId as string);
    res.json(reservation);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
}

async function getCart(req: Request, res: Response) {
  const { clientId } = req.params;

  const cart = await cartService.getByClientId(clientId as string);
  res.json(cart);
}

export const cartController = {
  reserve,
  cancel,
  getCart,
};
