import { OrdersResult } from "@/feature/orders/types/order.types";

export interface GetOrdersUseCase {
  execute(params: { accountRemoteId: string }): Promise<OrdersResult>;
}
