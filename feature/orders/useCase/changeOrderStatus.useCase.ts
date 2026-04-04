import { OrderResult, OrderStatusValue } from "@/feature/orders/types/order.types";

export interface ChangeOrderStatusUseCase {
  execute(params: { remoteId: string; status: OrderStatusValue }): Promise<OrderResult>;
}
