import type { DeleteBusinessTransactionUseCase } from "./deleteBusinessTransaction.useCase";
import type { DeleteMoneyMovementUseCase } from "./deleteMoneyMovement.useCase";

export const createDeleteBusinessTransactionUseCase = (
  deleteMoneyMovementUseCase: DeleteMoneyMovementUseCase,
): DeleteBusinessTransactionUseCase => deleteMoneyMovementUseCase;
