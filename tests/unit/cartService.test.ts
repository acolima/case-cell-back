import { cartService } from "../../src/services/cartService";
import { productsService } from "../../src/services/productsService";
import {
  getReservedQuantity,
  getItemInClientCart,
  updateItemQuantity,
  deleteReservationItem,
  getClientReservations,
} from "../../src/services/reservationsState";

jest.mock("../../src/services/productsService");
jest.mock("../../src/services/reservationsState");
jest.mock("../../src/utils/errorUtils", () => ({
  conflictError: jest.fn((msg) => new Error(`Conflict: ${msg}`)),
  notFoundError: jest.fn((msg) => new Error(`NotFound: ${msg}`)),
}));

describe("cartService", () => {
  const mockClientId = "client-123";
  const mockProductId = 1;
  const mockProduct = { id: 1, name: "Capinha Teste", quantity: 10 };
  const mockReservation = {
    id: "res-1",
    productId: 1,
    quantity: 2,
    clientId: mockClientId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reserve()", () => {
    it("deve lançar notFoundError se o produto não existir", async () => {
      (productsService.getById as jest.Mock).mockReturnValue(null);

      await expect(
        cartService.reserve(mockProductId, mockClientId, 1),
      ).rejects.toThrow("NotFound: Produto com ID 1 não encontrado.");
    });

    it("deve lançar conflictError se a quantidade solicitada for maior que o estoque", async () => {
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (getItemInClientCart as jest.Mock).mockReturnValue(null);
      (getReservedQuantity as jest.Mock).mockReturnValue(9);

      await expect(
        cartService.reserve(mockProductId, mockClientId, 2),
      ).rejects.toThrow(
        'Conflict: Estoque insuficiente para o produto "Capinha Teste".',
      );
    });

    it("deve lançar conflictError ao tentar reduzir quantidade de um produto que não está no carrinho", async () => {
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (getItemInClientCart as jest.Mock).mockReturnValue(null);

      await expect(
        cartService.reserve(mockProductId, mockClientId, 1, "decrease"),
      ).rejects.toThrow(
        'Conflict: O produto "Capinha Teste" não está no carrinho para ter a quantidade reduzida.',
      );
    });

    it("deve adicionar o produto ao carrinho (action = set / isAbsolute = true)", async () => {
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (getItemInClientCart as jest.Mock).mockReturnValue({ quantity: 2 });
      (getReservedQuantity as jest.Mock).mockReturnValue(2);
      (updateItemQuantity as jest.Mock).mockReturnValue(mockReservation);

      const result = await cartService.reserve(
        mockProductId,
        mockClientId,
        5,
        "set",
      );

      expect(updateItemQuantity).toHaveBeenCalledWith(
        mockClientId,
        mockProductId,
        5,
        600000,
        true,
      );
      expect(result).toEqual(mockReservation);
    });

    it("deve incrementar a quantidade do produto no carrinho (action = increase)", async () => {
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (getItemInClientCart as jest.Mock).mockReturnValue({ quantity: 2 });
      (getReservedQuantity as jest.Mock).mockReturnValue(2);
      (updateItemQuantity as jest.Mock).mockReturnValue(mockReservation);

      await cartService.reserve(mockProductId, mockClientId, 3, "increase");

      expect(updateItemQuantity).toHaveBeenCalledWith(
        mockClientId,
        mockProductId,
        3,
        600000,
        false,
      );
    });

    it("deve decrementar a quantidade do produto no carrinho (action = decrease)", async () => {
      (productsService.getById as jest.Mock).mockReturnValue(mockProduct);
      (getItemInClientCart as jest.Mock).mockReturnValue({ quantity: 5 });
      (updateItemQuantity as jest.Mock).mockReturnValue(mockReservation);

      await cartService.reserve(mockProductId, mockClientId, 2, "decrease");

      expect(updateItemQuantity).toHaveBeenCalledWith(
        mockClientId,
        mockProductId,
        -2,
        600000,
        false,
      );
    });
  });

  describe("cancel()", () => {
    it("deve deletar a reserva com sucesso", async () => {
      (deleteReservationItem as jest.Mock).mockReturnValue(mockReservation);

      const result = await cartService.cancel("res-1");

      expect(deleteReservationItem).toHaveBeenCalledWith("res-1");
      expect(result).toEqual(mockReservation);
    });

    it("deve lançar notFoundError se a reserva não existir ao cancelar", async () => {
      (deleteReservationItem as jest.Mock).mockReturnValue(null);

      await expect(cartService.cancel("res-inexistente")).rejects.toThrow(
        'NotFound: Reserva "res-inexistente" não encontrada ou já expirou.',
      );
    });
  });

  describe("getByClientId()", () => {
    it("deve retornar a lista de reservas do cliente", async () => {
      const mockList = [mockReservation];
      (getClientReservations as jest.Mock).mockReturnValue(mockList);

      const result = await cartService.getByClientId(mockClientId);

      expect(getClientReservations).toHaveBeenCalledWith(mockClientId);
      expect(result).toEqual(mockList);
    });
  });
});
