import { OrderOperationResult } from "@/feature/orders/types/order.types";

export interface DeleteOrderUseCase {
  execute(remoteId: string): Promise<OrderOperationResult>;
}
