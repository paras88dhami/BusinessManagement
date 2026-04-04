import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { OrderValidationError } from "@/feature/orders/types/order.types";
import { AssignOrderCustomerUseCase } from "./assignOrderCustomer.useCase";

export const createAssignOrderCustomerUseCase = (
  repository: OrderRepository,
): AssignOrderCustomerUseCase => ({
  async execute(params: { orderRemoteId: string; customerRemoteId: string | null }) {
    const normalizedOrderRemoteId = params.orderRemoteId.trim();
    if (!normalizedOrderRemoteId) {
      return { success: false, error: OrderValidationError("Order remote id is required.") };
    }
    return repository.assignOrderCustomer(normalizedOrderRemoteId, params.customerRemoteId);
  },
});
