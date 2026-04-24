import type {
  CreatePosSaleRecordParams,
  GetPosSaleByIdempotencyKeyParams,
  GetPosSalesParams,
  UpdatePosSaleWorkflowStateParams,
} from "../../types/posSale.dto.types";
import type {
  PosSaleLookupResult,
  PosSaleResult,
  PosSalesResult,
} from "../../types/posSale.error.types";

export interface PosSaleRepository {
  createPosSaleRecord(params: CreatePosSaleRecordParams): Promise<PosSaleResult>;
  getPosSaleByIdempotencyKey(
    params: GetPosSaleByIdempotencyKeyParams,
  ): Promise<PosSaleLookupResult>;
  getPosSales(params: GetPosSalesParams): Promise<PosSalesResult>;
  updatePosSaleWorkflowState(
    params: UpdatePosSaleWorkflowStateParams,
  ): Promise<PosSaleResult>;
}
