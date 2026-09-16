import { Request, Response } from "express";
import { productsService } from "../services/productsService.js";
import { ValidationError } from "../errors/appErrors.js";
import { handleControllerError } from "../errors/errorHandler.js";

async function get(req: Request, res: Response) {
  try {
    const products = await productsService.get();
    res.json(products);
  } catch (error: any) {
    handleControllerError(res, error);
  }
}

async function getById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      throw new ValidationError(
        "O ID do produto deve ser um número positivo válido.",
      );
    }

    const product = await productsService.getProductById(id);
    res.json(product);
  } catch (error: any) {
    handleControllerError(res, error);
  }
}

async function create(req: Request, res: Response) {
  try {
    const { name, model, price, brand, rating, reviews, tag, color, quantity } =
      req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new ValidationError("O campo 'name' deve ser um texto.");
    }
    if (!model || typeof model !== "string" || model.trim() === "") {
      throw new ValidationError("O campo 'model' deve ser um texto.");
    }
    if (!brand || typeof brand !== "string" || brand.trim() === "") {
      throw new ValidationError("O campo 'brand' deve ser um texto.");
    }
    if (
      price === undefined ||
      typeof price !== "number" ||
      isNaN(price) ||
      price < 0
    ) {
      throw new ValidationError(
        "O campo 'price' deve ser um número maior ou igual a zero.",
      );
    }
    if (
      quantity === undefined ||
      typeof quantity !== "number" ||
      isNaN(quantity) ||
      quantity < 0
    ) {
      throw new ValidationError(
        "O campo 'quantity' deve ser um número maior ou igual a zero.",
      );
    }

    const newProduct = await productsService.create({
      name: name.trim(),
      model: model.trim(),
      brand: brand.trim(),
      price: Number(price),
      rating: typeof rating === "number" ? rating : 5,
      color: typeof color === "string" ? color : "Padrão",
      tag,
      reviews: typeof reviews === "number" ? reviews : 0,
      quantity: Number(quantity),
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    handleControllerError(res, error);
  }
}

export const productsController = {
  get,
  getById,
  create,
};
