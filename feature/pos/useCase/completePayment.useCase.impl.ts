import { PosRepository } from "../data/repository/pos.repository";
import { PosCompletePaymentParams } from "../types/pos.dto.types";
import { PosPaymentResult } from "../types/pos.error.types";
import { CompletePaymentUseCase } from "./completePayment.useCase";

export const createCompletePaymentUseCase = (
  repository: PosRepository,
): CompletePaymentUseCase => ({
  async execute(params: PosCompletePaymentParams): Promise<PosPaymentResult> {
    const commitResult = await repository.commitCheckoutInventory({
      businessAccountRemoteId: params.businessAccountRemoteId,
      cartLines: params.cartLines,
      receiptNumber: params.receipt.receiptNumber,
    });
    if (!commitResult.success) {
      return {
        success: false,
        error: commitResult.error,
      };
    }

    return {
      success: true,
      value: params.receipt,
    };
  },
});
