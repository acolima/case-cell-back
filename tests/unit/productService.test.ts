import { productsService } from "../../src/services/productsService";
import { getReservedQuantity } from "../../src/services/reservationsState";

jest.mock("../../src/services/reservationsState");
jest.mock("../../src/utils/errorUtils", () => ({
  conflictError: jest.fn((msg) => new Error(`Conflict: ${msg}`)),
  notFoundError: jest.fn((msg) => new Error(`NotFound: ${msg}`)),
}));

describe("productsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get()", () => {
    it("deve retornar todos os produtos com a quantidade descontando as reservas", async () => {
      (getReservedQuantity as jest.Mock).mockReturnValue(2);

      const products = await productsService.get();

      expect(products.length).toBeGreaterThan(0);

      const product1 = products.find((p) => p.id === 1);
      expect(product1?.quantity).toBe(3);
    });

    it("nunca deve retornar quantidade negativa, o mínimo é 0", async () => {
      (getReservedQuantity as jest.Mock).mockReturnValue(100);

      const products = await productsService.get();
      const product1 = products.find((p) => p.id === 1);

      expect(product1?.quantity).toBe(0);
    });
  });

  describe("getProductById()", () => {
    it("deve retornar o produto com estoque ajustado pelas reservas", async () => {
      (getReservedQuantity as jest.Mock).mockReturnValue(1);

      const product = await productsService.getProductById(2);

      expect(product.id).toBe(2);
      expect(product.quantity).toBe(2);
    });

    it("deve lançar notFoundError se o produto não for encontrado", async () => {
      await expect(productsService.getProductById(999)).rejects.toThrow(
        "NotFound: Produto com ID 999 não encontrado.",
      );
    });
  });

  describe("getById()", () => {
    it("deve retornar o produto bruto sem ajustar o estoque", () => {
      const product = productsService.getById(3);

      expect(product).toBeDefined();
      expect(product?.quantity).toBe(2);
      expect(getReservedQuantity).not.toHaveBeenCalled();
    });

    it("deve retornar undefined se não existir", () => {
      const product = productsService.getById(999);
      expect(product).toBeUndefined();
    });
  });

  describe("create()", () => {
    it("deve criar e adicionar um novo produto ao array", async () => {
      const newProductData = {
        name: "Capinha de Teste",
        model: "Galaxy S20",
        brand: "Samsung",
        price: 19.9,
        rating: 5,
        reviews: 0,
        quantity: 10,
        color: "Branco",
      };

      const createdProduct = await productsService.create(newProductData);

      expect(createdProduct).toHaveProperty("id");
      expect(createdProduct).toHaveProperty("createdAt");
      expect(createdProduct.name).toBe("Capinha de Teste");

      const foundProduct = productsService.getById(createdProduct.id);
      expect(foundProduct).toBeDefined();
      expect(foundProduct?.name).toBe("Capinha de Teste");
    });
  });

  describe("decreaseStock()", () => {
    it("deve diminuir o estoque do produto bruto se houver saldo", () => {
      productsService.decreaseStock(4, 1);

      const product = productsService.getById(4);
      expect(product?.quantity).toBe(1);
    });

    it("deve lançar conflictError se tentar diminuir mais do que o estoque disponível", () => {
      expect(() => {
        productsService.decreaseStock(6, 5);
      }).toThrow(
        'Conflict: Estoque insuficiente para o produto "Capinha Carteira"',
      );
    });

    it("deve lançar notFoundError se o produto não for encontrado", () => {
      expect(() => {
        productsService.decreaseStock(999, 1);
      }).toThrow("NotFound: Produto com ID 999 não encontrado.");
    });
  });
});
