import { OrderResult } from "@/feature/orders/types/order.types";

export interface AssignOrderCustomerUseCase {
  execute(params: { orderRemoteId: string; customerRemoteId: string | null }): Promise<OrderResult>;
}
