import { PosChangeQuantityParams } from "../types/pos.dto.types";
import { PosCartLinesResult } from "../types/pos.error.types";

export interface ChangeCartLineQuantityUseCase {
  execute(params: PosChangeQuantityParams): Promise<PosCartLinesResult>;
}
