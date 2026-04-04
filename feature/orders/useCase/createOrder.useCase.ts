import { OrderResult, SaveOrderPayload } from "@/feature/orders/types/order.types";

export interface CreateOrderUseCase {
  execute(payload: SaveOrderPayload): Promise<OrderResult>;
}
