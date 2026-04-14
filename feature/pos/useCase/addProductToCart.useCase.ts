import { PosCartLinesResult } from "../types/pos.error.types";
import { PosAddProductToCartParams } from "../types/pos.dto.types";

export interface AddProductToCartUseCase {
  execute(params: PosAddProductToCartParams): Promise<PosCartLinesResult>;
}
