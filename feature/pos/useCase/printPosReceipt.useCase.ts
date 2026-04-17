import type { PosReceiptDocumentParams } from "../types/pos.dto.types";
import type { PosOperationResult } from "../types/pos.error.types";

export interface PrintPosReceiptUseCase {
  execute(params: PosReceiptDocumentParams): Promise<PosOperationResult>;
}
