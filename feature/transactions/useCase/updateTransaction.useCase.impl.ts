import { createAddTransactionUseCase } from "./addTransaction.useCase.impl";
import { PostBusinessTransactionUseCase } from "./postBusinessTransaction.useCase";
import { UpdateTransactionUseCase } from "./updateTransaction.useCase";

export const createUpdateTransactionUseCase = (
  postBusinessTransactionUseCase: PostBusinessTransactionUseCase,
): UpdateTransactionUseCase => ({
  async execute(payload) {
    const addTransactionUseCase = createAddTransactionUseCase(
      postBusinessTransactionUseCase,
    );
    return addTransactionUseCase.execute(payload);
  },
});
