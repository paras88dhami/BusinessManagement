import { OrderResult } from "@/feature/orders/types/order.types";

export interface ReturnOrderUseCase {
  execute(remoteId: string): Promise<OrderResult>;
}
