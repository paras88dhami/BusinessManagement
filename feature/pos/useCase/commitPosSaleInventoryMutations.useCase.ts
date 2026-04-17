import type { PosCommitSaleInventoryMutationsParams } from "../types/pos.dto.types";
import type { PosOperationResult } from "../types/pos.error.types";

export interface CommitPosSaleInventoryMutationsUseCase {
  execute(
    params: PosCommitSaleInventoryMutationsParams,
  ): Promise<PosOperationResult>;
}
