import { PosReceipt } from "../types/pos.entity.types";
import { PosOperationResult } from "../types/pos.error.types";

export interface PrintReceiptUseCase {
  execute(receipt: PosReceipt): Promise<PosOperationResult>;
}
