import { PosAssignProductToSlotParams } from "../types/pos.dto.types";
import { PosCartLinesResult } from "../types/pos.error.types";

export interface AssignProductToSlotUseCase {
  execute(params: PosAssignProductToSlotParams): Promise<PosCartLinesResult>;
}
