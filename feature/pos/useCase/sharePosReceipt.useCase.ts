import type { PosReceiptDocumentParams } from "../types/pos.dto.types";
import type { PosOperationResult } from "../types/pos.error.types";

export interface SharePosReceiptUseCase {
  execute(params: PosReceiptDocumentParams): Promise<PosOperationResult>;
}
