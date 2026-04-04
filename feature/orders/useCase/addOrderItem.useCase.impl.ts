import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderLineResult, OrderValidationError, SaveOrderLinePayload } from "@/feature/orders/types/order.types";
import { AddOrderItemUseCase } from "./addOrderItem.useCase";

export const createAddOrderItemUseCase = (
  repository: OrderRepository,
): AddOrderItemUseCase => ({
  async execute(payload: SaveOrderLinePayload): Promise<OrderLineResult> {
    if (!payload.orderRemoteId.trim()) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    if (!payload.productRemoteId.trim()) {
      return { success: false, error: OrderValidationError("Product is required.") };
    }
    if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) {
      return { success: false, error: OrderValidationError("Quantity must be greater than zero.") };
    }
    return repository.addOrderItem(payload);
  },
});
