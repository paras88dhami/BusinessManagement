import { MoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository";
import { TransactionOperationResult } from "@/feature/transactions/types/transaction.entity.types";
import { TransactionValidationError } from "@/feature/transactions/types/transaction.error.types";
import { DeleteMoneyMovementUseCase } from "./deleteMoneyMovement.useCase";

export const createDeleteMoneyMovementUseCase = (
  repository: MoneyPostingRepository,
): DeleteMoneyMovementUseCase => ({
  async execute(remoteId: string): Promise<TransactionOperationResult> {
    const normalizedRemoteId = remoteId.trim();

    if (!normalizedRemoteId) {
      return {
        success: false,
        error: TransactionValidationError("Transaction id is required."),
      };
    }

    return repository.deleteMoneyMovementByRemoteId(normalizedRemoteId);
  },
});
