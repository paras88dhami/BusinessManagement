import type { PostBusinessTransactionUseCase } from "./postBusinessTransaction.useCase";
import type { PostMoneyMovementUseCase } from "./postMoneyMovement.useCase";

export const createPostBusinessTransactionUseCase = (
  postMoneyMovementUseCase: PostMoneyMovementUseCase,
): PostBusinessTransactionUseCase => postMoneyMovementUseCase;
