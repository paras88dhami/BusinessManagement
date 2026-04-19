import { createLocalMoneyAccountBalanceDatasource } from "@/feature/transactions/data/dataSource/local.moneyAccountBalance.datasource.impl";
import { createLocalMoneyPostingDatasource } from "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl";
import { createMoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository.impl";
import { createMoneyPostingWorkflowRepository } from "@/feature/transactions/workflow/moneyPosting/repository/moneyPostingWorkflow.repository.impl";
import { Database } from "@nozbe/watermelondb";
import { createDeleteMoneyMovementUseCase } from "./deleteMoneyMovement.useCase.impl";
import { DeleteBusinessTransactionUseCase } from "./deleteBusinessTransaction.useCase";

export const createDeleteBusinessTransactionUseCase = (
  database: Database,
): DeleteBusinessTransactionUseCase => {
  const transactionDatasource = createLocalMoneyPostingDatasource(database);
  const moneyAccountBalanceDatasource =
    createLocalMoneyAccountBalanceDatasource(database);
  const workflowRepository = createMoneyPostingWorkflowRepository({
    transactionDatasource,
    moneyAccountBalanceDatasource,
  });
  const repositoryAdapter = createMoneyPostingRepository(workflowRepository);
  return createDeleteMoneyMovementUseCase(repositoryAdapter);
};
