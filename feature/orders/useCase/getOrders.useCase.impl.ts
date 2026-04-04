import { OrderRepository } from "@/feature/orders/data/repository/order.repository";
import { GetOrdersUseCase } from "./getOrders.useCase";

export const createGetOrdersUseCase = (
  repository: OrderRepository,
): GetOrdersUseCase => ({
  execute(params: { accountRemoteId: string }) {
    return repository.getOrdersByAccountRemoteId(params.accountRemoteId);
  },
});
