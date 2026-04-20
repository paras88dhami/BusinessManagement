import { Order, OrderError } from "@/feature/orders/types/order.types";
import { OrderSettlementSnapshot } from "@/feature/orders/types/orderSettlement.dto.types";
import { Result } from "@/shared/types/result.types";

export type { OrderSettlementSnapshot } from "@/feature/orders/types/orderSettlement.dto.types";

export type GetOrderSettlementSnapshotsResult = Result<
  Readonly<Record<string, OrderSettlementSnapshot>>,
  OrderError
>;

export interface GetOrderSettlementSnapshotsUseCase {
  execute(params: {
    accountRemoteId: string;
    ownerUserRemoteId: string | null;
    orders: readonly Order[];
    attemptLegacyRepair?: boolean;
  }): Promise<GetOrderSettlementSnapshotsResult>;
}
