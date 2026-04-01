import { PosApplyAmountAdjustmentParams } from "../types/pos.dto.types";
import { PosTotalsResult } from "../types/pos.error.types";

export interface ApplyDiscountUseCase {
  execute(params: PosApplyAmountAdjustmentParams): Promise<PosTotalsResult>;
}
