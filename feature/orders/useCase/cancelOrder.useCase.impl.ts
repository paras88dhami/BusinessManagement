import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderStatus, OrderValidationError } from "@/feature/orders/types/order.types";
import { CancelOrderUseCase } from "./cancelOrder.useCase";

export const createCancelOrderUseCase = (
  repository: OrderRepository,
): CancelOrderUseCase => ({
  async execute(remoteId: string) {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    return repository.updateOrderStatusByRemoteId(normalizedRemoteId, OrderStatus.Cancelled);
  },
});
