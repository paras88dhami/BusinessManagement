import type { PosReceiptDocumentParams } from "../types/pos.dto.types";
import type { PosOperationResult } from "../types/pos.error.types";

export interface PosReceiptDocumentAdapter {
  printReceiptDocument(
    params: PosReceiptDocumentParams,
  ): Promise<PosOperationResult>;
  shareReceiptDocument(
    params: PosReceiptDocumentParams,
  ): Promise<PosOperationResult>;
}
