import { serviceUnavailableError } from "../utils/errorUtils.js";

interface ErpProcessOptions {
  forceError?: boolean;
  delayMs?: number;
}

async function processOrderInErp(
  orderData: { clientId: string; total: number; itemCount: number },
  options: ErpProcessOptions = {},
): Promise<{ protocol: string; processedAt: Date }> {
  const delay = options.delayMs ?? 1200 + Math.floor(Math.random() * 1000);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const shouldFail = options.forceError ?? Math.random() < 0.2;

  if (shouldFail) {
    console.warn(
      `[ERP Simulation] Falha transitória no ERP para o cliente ${orderData.clientId}. Simulação de instabilidade/503.`,
    );
    throw serviceUnavailableError(
      "O sistema externo do ERP está temporariamente instável ou indisponível. A sua reserva continua ativa no carrinho, tente novamente.",
    );
  }

  const protocol = `ERP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  console.log(
    `[ERP Simulation] Pedido processado no ERP com sucesso. Protocolo: ${protocol} (Latência: ${delay}ms)`,
  );

  return {
    protocol,
    processedAt: new Date(),
  };
}

export const erpService = {
  processOrderInErp,
};
