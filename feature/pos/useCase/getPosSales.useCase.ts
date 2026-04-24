import type { GetPosSalesParams } from "../types/posSale.dto.types";
import type {
  PosSaleError,
  PosSalesResult,
} from "../types/posSale.error.types";

export type { GetPosSalesParams, PosSalesResult };

export interface PosSalesReaderRepository {
  getPosSales(params: GetPosSalesParams): Promise<PosSalesResult>;
}

export interface GetPosSalesUseCase {
  execute(params: GetPosSalesParams): Promise<PosSalesResult>;
}
