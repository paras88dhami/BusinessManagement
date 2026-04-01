import { PosRepository } from "../data/repository/pos.repository";
import { PosReceipt } from "../types/pos.entity.types";
import { PosOperationResult } from "../types/pos.error.types";
import { PrintReceiptUseCase } from "./printReceipt.useCase";

export const createPrintReceiptUseCase = (
  repository: PosRepository,
): PrintReceiptUseCase => ({
  async execute(receipt: PosReceipt): Promise<PosOperationResult> {
    return repository.printReceipt(receipt);
  },
});
