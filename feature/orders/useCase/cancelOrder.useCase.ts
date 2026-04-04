import { OrderResult } from "@/feature/orders/types/order.types";

export interface CancelOrderUseCase {
  execute(remoteId: string): Promise<OrderResult>;
}
