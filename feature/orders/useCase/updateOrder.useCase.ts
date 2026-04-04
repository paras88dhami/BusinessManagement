import { OrderResult, SaveOrderPayload } from "@/feature/orders/types/order.types";

export interface UpdateOrderUseCase {
  execute(payload: SaveOrderPayload): Promise<OrderResult>;
}
