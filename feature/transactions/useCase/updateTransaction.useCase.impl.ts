import { createAddTransactionUseCase } from "./addTransaction.useCase.impl";
import { PostMoneyMovementUseCase } from "./postMoneyMovement.useCase";
import { UpdateTransactionUseCase } from "./updateTransaction.useCase";

export const createUpdateTransactionUseCase = (
  postMoneyMovementUseCase: PostMoneyMovementUseCase,
): UpdateTransactionUseCase => ({
  async execute(payload) {
    const addTransactionUseCase = createAddTransactionUseCase(
      postMoneyMovementUseCase,
    );
    return addTransactionUseCase.execute(payload);
  },
});
