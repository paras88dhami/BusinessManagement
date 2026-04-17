import type { PosGetSaleHistoryParams } from "../types/pos.dto.types";
import type { PosSaleHistoryResult } from "../types/pos.error.types";

export interface GetPosSaleHistoryUseCase {
  execute(params: PosGetSaleHistoryParams): Promise<PosSaleHistoryResult>;
}
