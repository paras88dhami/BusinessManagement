import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderStatus, OrderValidationError } from "@/feature/orders/types/order.types";
import { ReturnOrderUseCase } from "./returnOrder.useCase";

export const createReturnOrderUseCase = (
  repository: OrderRepository,
): ReturnOrderUseCase => ({
  async execute(remoteId: string) {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    return repository.updateOrderStatusByRemoteId(normalizedRemoteId, OrderStatus.Returned);
  },
});
