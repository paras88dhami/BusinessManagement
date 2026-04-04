import { OrderResult } from "@/feature/orders/types/order.types";

export interface GetOrderByIdUseCase {
  execute(remoteId: string): Promise<OrderResult>;
}
