import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderResult, OrderValidationError, SaveOrderPayload } from "@/feature/orders/types/order.types";
import { UpdateOrderUseCase } from "./updateOrder.useCase";

export const createUpdateOrderUseCase = (
  repository: OrderRepository,
): UpdateOrderUseCase => ({
  async execute(payload: SaveOrderPayload): Promise<OrderResult> {
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!payload.remoteId.trim()) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    if (!payload.orderNumber.trim()) {
      return { success: false, error: OrderValidationError("Order number is required.") };
    }
    if (items.length === 0) {
      return { success: false, error: OrderValidationError("Add at least one order item.") };
    }

    if (
      items.some(
        (item) =>
          !item.productRemoteId?.trim() ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0,
      )
    ) {
      return {
        success: false,
        error: OrderValidationError(
          "Each order item must have a product and quantity greater than zero.",
        ),
      };
    }

    return repository.saveOrder(payload);
  },
});
