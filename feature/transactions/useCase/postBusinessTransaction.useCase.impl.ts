import { createLocalMoneyPostingDatasource } from "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl";
import { createMoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository.impl";
import { Database } from "@nozbe/watermelondb";
import { createPostMoneyMovementUseCase } from "./postMoneyMovement.useCase.impl";
import { PostBusinessTransactionUseCase } from "./postBusinessTransaction.useCase";

export const createPostBusinessTransactionUseCase = (
  database: Database,
): PostBusinessTransactionUseCase => {
  const datasource = createLocalMoneyPostingDatasource(database);
  const repository = createMoneyPostingRepository(datasource);
  return createPostMoneyMovementUseCase(repository);
};
