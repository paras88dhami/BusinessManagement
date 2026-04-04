import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderOperationResult, OrderValidationError } from "@/feature/orders/types/order.types";
import { RemoveOrderItemUseCase } from "./removeOrderItem.useCase";

export const createRemoveOrderItemUseCase = (
  repository: OrderRepository,
): RemoveOrderItemUseCase => ({
  async execute(remoteId: string): Promise<OrderOperationResult> {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return { success: false, error: OrderValidationError("Order item remote id is required.") };
    }
    return repository.removeOrderItemByRemoteId(normalizedRemoteId);
  },
});
