import { OrderOperationResult } from "@/feature/orders/types/order.types";

export interface RemoveOrderItemUseCase {
  execute(remoteId: string): Promise<OrderOperationResult>;
}
