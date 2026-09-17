import { Request, Response } from "express";
import { ordersService } from "../services/ordersService.js";
import { validationError } from "../utils/errorUtils.js";

async function checkout(req: Request, res: Response) {
  const {
    clientId,
    idempotencyKey: bodyIdempotencyKey,
    simulateErpError,
    simulateErpDelayMs,
  } = req.body;

  const headerIdempotencyKey =
    req.header("Idempotency-Key") || req.header("idempotency-key");
  const idempotencyKey = (headerIdempotencyKey || bodyIdempotencyKey) as
    | string
    | undefined;

  if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
    throw validationError("O campo 'clientId' deve ser uma string não vazia.");
  }

  const order = await ordersService.checkout(clientId.trim(), {
    idempotencyKey: idempotencyKey?.trim(),
    simulateErpError: Boolean(
      simulateErpError || req.query.simulateErpError === "true",
    ),
    simulateErpDelayMs: simulateErpDelayMs
      ? Number(simulateErpDelayMs)
      : undefined,
  });

  return res.status(201).json(order);
}

async function getOrders(req: Request, res: Response) {
  const { clientId } = req.query;

  if (clientId) {
    if (typeof clientId !== "string" || clientId.trim() === "") {
      throw validationError(
        "O campo 'clientId' deve ser uma string não vazia.",
      );
    }

    const orders = await ordersService.getOrdersByClientId(
      clientId as string,
    );
    return res.json(orders);
  }

  const orders = await ordersService.getOrders();
  return res.json(orders);
}

export const ordersController = {
  checkout,
  getOrders,
};
