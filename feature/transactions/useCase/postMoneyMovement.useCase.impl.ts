import { MoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository";
import {
  SaveTransactionPayload,
  TransactionResult,
} from "@/feature/transactions/types/transaction.entity.types";
import { TransactionValidationError } from "@/feature/transactions/types/transaction.error.types";
import { normalizeMoneyPostingPayload } from "@/feature/transactions/workflow/moneyPosting/utils/normalizeMoneyPostingPayload.util";
import { validateMoneyPostingPayload } from "@/feature/transactions/workflow/moneyPosting/utils/validateMoneyPostingPayload.util";
import { PostMoneyMovementUseCase } from "./postMoneyMovement.useCase";

export const createPostMoneyMovementUseCase = (
  repository: MoneyPostingRepository,
): PostMoneyMovementUseCase => ({
  async execute(payload: SaveTransactionPayload): Promise<TransactionResult> {
    const normalizedPayload = normalizeMoneyPostingPayload(payload);
    const validationError = validateMoneyPostingPayload(normalizedPayload);

    if (validationError) {
      return {
        success: false,
        error: TransactionValidationError(validationError),
      };
    }

    return repository.postMoneyMovement(normalizedPayload);
  },
});
