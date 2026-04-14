import { PosOperationResult } from "../types/pos.error.types";
import { PosClearSessionParams } from "../types/pos.dto.types";

export interface ClearPosSessionUseCase {
  execute(params: PosClearSessionParams): Promise<PosOperationResult>;
}
