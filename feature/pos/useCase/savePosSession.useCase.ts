import { PosOperationResult } from "../types/pos.error.types";
import { PosSaveSessionParams } from "../types/pos.dto.types";

export interface SavePosSessionUseCase {
  execute(params: PosSaveSessionParams): Promise<PosOperationResult>;
}
