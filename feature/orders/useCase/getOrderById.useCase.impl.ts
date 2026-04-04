import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderValidationError } from "@/feature/orders/types/order.types";
import { GetOrderByIdUseCase } from "./getOrderById.useCase";

export const createGetOrderByIdUseCase = (
  repository: OrderRepository,
): GetOrderByIdUseCase => ({
  async execute(remoteId: string) {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return {
        success: false,
        error: OrderValidationError("Order remote id is required."),
      };
    }

    return repository.getOrderByRemoteId(normalizedRemoteId);
  },
});
