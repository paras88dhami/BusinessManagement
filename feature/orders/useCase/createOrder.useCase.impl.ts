import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderResult, OrderValidationError, SaveOrderPayload } from "@/feature/orders/types/order.types";
import { CreateOrderUseCase } from "./createOrder.useCase";

const validatePayload = (payload: SaveOrderPayload): string | null => {
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!payload.remoteId.trim()) return "Order remote id is required.";
  if (!payload.ownerUserRemoteId.trim()) return "User context is required.";
  if (!payload.accountRemoteId.trim()) return "An active business account is required.";
  if (!payload.orderNumber.trim()) return "Order number is required.";
  if (!Number.isFinite(payload.orderDate) || payload.orderDate <= 0) {
    return "Order date is required.";
  }
  if (items.length === 0) return "Add at least one order item.";
  if (
    items.some(
      (item) =>
        !item.productRemoteId?.trim() ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0,
    )
  ) {
    return "Each order item must have a product and quantity greater than zero.";
  }
  return null;
};

export const createCreateOrderUseCase = (
  repository: OrderRepository,
): CreateOrderUseCase => ({
  async execute(payload: SaveOrderPayload): Promise<OrderResult> {
    const validationError = validatePayload(payload);
    if (validationError) {
      return { success: false, error: OrderValidationError(validationError) };
    }
    return repository.saveOrder(payload);
  },
});
