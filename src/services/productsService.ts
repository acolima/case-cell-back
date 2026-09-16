import { randomUUID } from "crypto";
import { Product } from "../domain/product.js";
import { getReservedQuantity } from "./reservationsState.js";

async function get() {
  return products.map((product) => {
    const reserved = getReservedQuantity(product.id);

    return {
      ...product,
      quantity: Math.max(0, product.quantity - reserved),
    };
  });
}

async function create(data: Omit<Product, "id" | "createdAt">) {
  const newProduct: Product = {
    id: randomUUID() as unknown as number,
    ...data,
    createdAt: new Date(),
  };

  products.push(newProduct);

  return newProduct;
}

function getById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

function decreaseStock(id: number, quantity: number): void {
  const product = products.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Produto com ID ${id} não encontrado.`);
  }

  if (product.quantity < quantity) {
    throw new Error(`Estoque insuficiente para o produto "${product.name}".`);
  }

  product.quantity -= quantity;
}

export const productsService = {
  get,
  getById,
  create,
  decreaseStock,
};

const products: Product[] = [
  {
    id: 1,
    name: "Capinha Transparente",
    model: "iPhone 15",
    brand: "Apple",
    price: 29.9,
    rating: 4.5,
    reviews: 128,
    quantity: 5,
    tag: "Mais vendido",
    color: "Transparente",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: 2,
    name: "Capinha Carbon",
    model: "iPhone 15 Pro",
    brand: "Apple",
    price: 59.9,
    rating: 4.8,
    reviews: 74,
    quantity: 3,
    tag: "Novo",
    color: "Preto",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: 3,
    name: "Capinha Silicone",
    model: "Samsung Galaxy S24",
    brand: "Samsung",
    price: 39.9,
    rating: 4.3,
    reviews: 96,
    quantity: 2,
    color: "Azul",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 4,
    name: "Capinha Militar",
    model: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 79.9,
    rating: 4.7,
    reviews: 52,
    quantity: 2,
    tag: "Promoção",
    color: "Verde",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: 5,
    name: "Capinha Slim",
    model: "Motorola Edge 40",
    brand: "Motorola",
    price: 24.9,
    rating: 4.1,
    reviews: 43,
    quantity: 6,
    color: "Rosa",
    createdAt: new Date("2024-02-18"),
  },
  {
    id: 6,
    name: "Capinha Carteira",
    model: "Xiaomi 14",
    brand: "Xiaomi",
    price: 49.9,
    rating: 4.6,
    reviews: 31,
    quantity: 1,
    tag: "Novo",
    color: "Marrom",
    createdAt: new Date("2024-03-10"),
  },
];
