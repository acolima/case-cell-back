import { Request, Response } from "express";
import { productsService } from "../services/productsService.js";

async function get(req: Request, res: Response) {
  const products = await productsService.get();

  res.json(products);
}

async function create(req: Request, res: Response) {
  const { name, model, price, brand, rating, reviews, tag, color, quantity } =
    req.body;

  const newProduct = await productsService.create({
    name,
    model,
    brand,
    price,
    rating,
    color,
    tag,
    reviews,
    quantity,
  });

  res.status(201).json(newProduct);
}

export const productsController = {
  get,
  create,
};
