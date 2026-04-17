import type { PosReceiptDocumentAdapter } from "../adapter/posReceiptDocument.adapter";
import type { SharePosReceiptUseCase } from "./sharePosReceipt.useCase";

interface CreateSharePosReceiptUseCaseParams {
  receiptDocumentAdapter: PosReceiptDocumentAdapter;
}

export const createSharePosReceiptUseCase = ({
  receiptDocumentAdapter,
}: CreateSharePosReceiptUseCaseParams): SharePosReceiptUseCase => ({
  execute(params) {
    return receiptDocumentAdapter.shareReceiptDocument(params);
  },
});
