import type { PosCartLine } from "@/feature/pos/types/pos.entity.types";
import type { PosOperationResult } from "@/feature/pos/types/pos.error.types";

export interface CommitPosCheckoutInventoryUseCase {
  execute(params: {
    businessAccountRemoteId: string;
    saleRemoteId: string;
    saleReferenceNumber: string;
    cartLines: readonly PosCartLine[];
    movementAt: number;
  }): Promise<PosOperationResult>;
}
