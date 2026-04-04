import { OrderLineResult, SaveOrderLinePayload } from "@/feature/orders/types/order.types";

export interface AddOrderItemUseCase {
  execute(payload: SaveOrderLinePayload): Promise<OrderLineResult>;
}
