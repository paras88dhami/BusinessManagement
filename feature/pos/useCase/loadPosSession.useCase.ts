import { PosLoadSessionParams, PosSessionResult } from "../types/pos.dto.types";

export interface LoadPosSessionUseCase {
  execute(params: PosLoadSessionParams): Promise<PosSessionResult>;
}
