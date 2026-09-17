import { ordersService } from "../../src/services/ordersService";
import { productsService } from "../../src/services/productsService";
import {
  clearClientCart,
  getClientReservations,
} from "../../src/services/reservationsState";
import { erpService } from "../../src/services/erpService";

jest.mock("../../src/services/productsService");
jest.mock("../../src/services/reservationsState");
jest.mock("../../src/services/erpService");
jest.mock("../../src/utils/errorUtils", () => ({
  conflictError: jest.fn((msg) => new Error(`Conflict: ${msg}`)),
  notFoundError: jest.fn((msg) => new Error(`NotFound: ${msg}`)),
}));

describe("ordersService", () => {
  const mockClientId = "client-123";
  const mockProduct = { id: 1, name: "Capinha Premium", price: 50.0 };
  const mockReservations = [
    { productId: 1, quantity: 2, clientId: mockClientId },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkout()", () => {
    it("deve lançar notFoundError se o carrinho estiver vazio", async () => {
      (getClientReservations as jest.Mock).mockReturnValue([]);

      await expect(ordersService.checkout(mockClientId)).rejects.toThrow(
        "NotFound: Não foi possível finalizar o pedido: o carrinho está vazio ou a reserva já expirou.",
      );
    });

    it("deve lançar notFoundError se um produto reservado não existir mais no catálogo", async () => {
      (getClientReservations as jest.Mock).mockReturnValue(mockReservations);
      (productsService.getById as jest.Mock).mockReturnValue(null);

      await expect(ordersService.checkout(mockClientId)).rejects.toThrow(
        "NotFound: Produto com ID 1 não encontrado.",
      );
    });

    it("deve processar o pedido com sucesso (cálculos, ERP, estoque e limpeza de carrinho)", async () => {
      const clientId = "client-success";
      (getClientReservations as jest.Mock).mockReturnValue([
        { productId: 1, quantity: 2, clientId },
      ]);
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (erpService.processOrderInErp as jest.Mock).mockResolvedValue({
        protocol: "ERP-999",
      });

      const order = await ordersService.checkout(clientId);

      expect(order.total).toBe(100.0);
      expect(order.items[0].subtotal).toBe(100.0);
      expect(order.status).toBe("COMPLETED");
      expect(order.erpProtocol).toBe("ERP-999");
      expect(order.clientId).toBe(clientId);

      expect(erpService.processOrderInErp).toHaveBeenCalledWith(
        { clientId, total: 100.0, itemCount: 1 },
        { forceError: undefined, delayMs: undefined },
      );
      expect(productsService.decreaseStock).toHaveBeenCalledWith(1, 2);
      expect(clearClientCart).toHaveBeenCalledWith(clientId);
    });

    it("não deve diminuir estoque ou limpar carrinho se o ERP falhar", async () => {
      (getClientReservations as jest.Mock).mockReturnValue(mockReservations);
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (erpService.processOrderInErp as jest.Mock).mockRejectedValue(
        new Error("ERP fora do ar"),
      );

      await expect(ordersService.checkout(mockClientId)).rejects.toThrow(
        "ERP fora do ar",
      );

      expect(productsService.decreaseStock).not.toHaveBeenCalled();
      expect(clearClientCart).not.toHaveBeenCalled();
    });

    describe("Idempotência", () => {
      it("deve retornar o pedido do cache se a mesma idempotencyKey for usada novamente", async () => {
        const idempotencyKey = "idemp-key-1";

        (getClientReservations as jest.Mock).mockReturnValue(mockReservations);
        (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
        (erpService.processOrderInErp as jest.Mock).mockResolvedValue({
          protocol: "ERP-111",
        });

        const firstOrder = await ordersService.checkout(mockClientId, {
          idempotencyKey,
        });

        const secondOrder = await ordersService.checkout(mockClientId, {
          idempotencyKey,
        });

        expect(secondOrder).toEqual(firstOrder);
        expect(erpService.processOrderInErp).toHaveBeenCalledTimes(1);
      });

      it("deve lançar conflictError se chamadas simultâneas usarem a mesma chave", async () => {
        const idempotencyKey = "idemp-key-concurrent";

        (getClientReservations as jest.Mock).mockReturnValue(mockReservations);
        (productsService.getById as jest.Mock).mockReturnValue(mockProduct);

        (erpService.processOrderInErp as jest.Mock).mockImplementation(() => {
          return new Promise((resolve) =>
            setTimeout(() => resolve({ protocol: "123" }), 1000),
          );
        });

        const firstCallPromise = ordersService.checkout(mockClientId, {
          idempotencyKey,
        });

        await expect(
          ordersService.checkout(mockClientId, { idempotencyKey }),
        ).rejects.toThrow(
          "Conflict: Um pedido com esta mesma chave de idempotência já está sendo processado. Aguarde.",
        );

        await firstCallPromise;
      });
    });
  });

  describe("getOrders() & getOrdersByClientId()", () => {
    it("deve retornar o histórico correto de pedidos", async () => {
      const clientIdA = "client-A";
      const clientIdB = "client-B";

      (getClientReservations as jest.Mock).mockReturnValue([
        { productId: 1, quantity: 1, clientId: "X" },
      ]);
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (erpService.processOrderInErp as jest.Mock).mockResolvedValue({
        protocol: "OK",
      });

      await ordersService.checkout(clientIdA);
      await ordersService.checkout(clientIdB);
      await ordersService.checkout(clientIdA);

      const allOrders = await ordersService.getOrders();
      const clientAOrders = await ordersService.getOrdersByClientId(clientIdA);
      const clientBOrders = await ordersService.getOrdersByClientId(clientIdB);

      expect(allOrders.length).toBeGreaterThanOrEqual(3);
      expect(clientAOrders).toHaveLength(2);
      expect(clientBOrders).toHaveLength(1);
    });
  });
});
