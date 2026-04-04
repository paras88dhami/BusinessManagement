import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderOperationResult, OrderValidationError } from "@/feature/orders/types/order.types";
import { DeleteOrderUseCase } from "./deleteOrder.useCase";

export const createDeleteOrderUseCase = (
  repository: OrderRepository,
): DeleteOrderUseCase => ({
  async execute(remoteId: string): Promise<OrderOperationResult> {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    return repository.deleteOrderByRemoteId(normalizedRemoteId);
  },
});
