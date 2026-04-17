import type { PosReceiptDocumentAdapter } from "../adapter/posReceiptDocument.adapter";
import type { PrintPosReceiptUseCase } from "./printPosReceipt.useCase";

interface CreatePrintPosReceiptUseCaseParams {
  receiptDocumentAdapter: PosReceiptDocumentAdapter;
}

export const createPrintPosReceiptUseCase = ({
  receiptDocumentAdapter,
}: CreatePrintPosReceiptUseCaseParams): PrintPosReceiptUseCase => ({
  execute(params) {
    return receiptDocumentAdapter.printReceiptDocument(params);
  },
});
