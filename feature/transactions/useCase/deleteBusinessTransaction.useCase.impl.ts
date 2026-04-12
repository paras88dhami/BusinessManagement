import { createLocalMoneyPostingDatasource } from "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl";
import { createMoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository.impl";
import { Database } from "@nozbe/watermelondb";
import { createDeleteMoneyMovementUseCase } from "./deleteMoneyMovement.useCase.impl";
import { DeleteBusinessTransactionUseCase } from "./deleteBusinessTransaction.useCase";

export const createDeleteBusinessTransactionUseCase = (
  database: Database,
): DeleteBusinessTransactionUseCase => {
  const datasource = createLocalMoneyPostingDatasource(database);
  const repository = createMoneyPostingRepository(datasource);
  return createDeleteMoneyMovementUseCase(repository);
};
