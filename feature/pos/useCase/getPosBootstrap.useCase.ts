import { PosLoadBootstrapParams } from "../types/pos.dto.types";
import { PosBootstrapResult } from "../types/pos.error.types";

export interface GetPosBootstrapUseCase {
  execute(params: PosLoadBootstrapParams): Promise<PosBootstrapResult>;
}
