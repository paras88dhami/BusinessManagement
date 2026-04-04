import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderStatusValue, OrderValidationError } from "@/feature/orders/types/order.types";
import { ChangeOrderStatusUseCase } from "./changeOrderStatus.useCase";

export const createChangeOrderStatusUseCase = (
  repository: OrderRepository,
): ChangeOrderStatusUseCase => ({
  async execute(params: { remoteId: string; status: OrderStatusValue }) {
    const normalizedRemoteId = params.remoteId.trim();
    if (!normalizedRemoteId) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    return repository.updateOrderStatusByRemoteId(normalizedRemoteId, params.status);
  },
});
