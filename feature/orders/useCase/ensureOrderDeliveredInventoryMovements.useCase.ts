import { OrderError } from "@/feature/orders/types/order.types";
import { Result } from "@/shared/types/result.types";

export type EnsureOrderDeliveredInventoryMovementsResult = Result<
  { createdMovementRemoteIds: string[] },
  OrderError
>;

export interface EnsureOrderDeliveredInventoryMovementsUseCase {
  execute(
    orderRemoteId: string,
    movementAt: number,
  ): Promise<EnsureOrderDeliveredInventoryMovementsResult>;
}
