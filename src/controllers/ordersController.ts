import { Request, Response } from "express";
import { ordersService } from "../services/ordersService.js";

async function checkout(req: Request, res: Response) {
  const { clientId } = req.body;

  if (!clientId) {
    return res
      .status(400)
      .json({ message: "O clientId é obrigatório para finalizar o pedido." });
  }

  try {
    const order = await ordersService.checkout(clientId);
    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

async function getOrders(req: Request, res: Response) {
  const { clientId } = req.query;

  try {
    if (clientId) {
      const orders = await ordersService.getOrdersByClientId(clientId as string);
      return res.json(orders);
    }

    const orders = await ordersService.getOrders();
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export const ordersController = {
  checkout,
  getOrders,
};
