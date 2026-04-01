import { PosRemoveSlotProductParams } from "../types/pos.dto.types";
import { PosCartLinesResult } from "../types/pos.error.types";

export interface RemoveProductFromSlotUseCase {
  execute(params: PosRemoveSlotProductParams): Promise<PosCartLinesResult>;
}
