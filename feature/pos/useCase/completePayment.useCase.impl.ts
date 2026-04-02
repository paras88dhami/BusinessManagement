import { PosRepository } from "../data/repository/pos.repository";
import { PosCompletePaymentParams } from "../types/pos.dto.types";
import { PosPaymentResult } from "../types/pos.error.types";
import { CompletePaymentUseCase } from "./completePayment.useCase";

export const createCompletePaymentUseCase = (
  repository: PosRepository,
): CompletePaymentUseCase => ({
  async execute(params: PosCompletePaymentParams): Promise<PosPaymentResult> {
    return repository.completePayment(params);
  },
});
