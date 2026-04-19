import { createLocalMoneyAccountBalanceDatasource } from "@/feature/transactions/data/dataSource/local.moneyAccountBalance.datasource.impl";
import { createLocalMoneyPostingDatasource } from "@/feature/transactions/data/dataSource/local.moneyPosting.datasource.impl";
import { createMoneyPostingRepository } from "@/feature/transactions/data/repository/moneyPosting.repository.impl";
import { createMoneyPostingWorkflowRepository } from "@/feature/transactions/workflow/moneyPosting/repository/moneyPostingWorkflow.repository.impl";
import { Database } from "@nozbe/watermelondb";
import { createPostMoneyMovementUseCase } from "./postMoneyMovement.useCase.impl";
import { PostBusinessTransactionUseCase } from "./postBusinessTransaction.useCase";

export const createPostBusinessTransactionUseCase = (
  database: Database,
): PostBusinessTransactionUseCase => {
  const transactionDatasource = createLocalMoneyPostingDatasource(database);
  const moneyAccountBalanceDatasource =
    createLocalMoneyAccountBalanceDatasource(database);
  const workflowRepository = createMoneyPostingWorkflowRepository({
    transactionDatasource,
    moneyAccountBalanceDatasource,
  });
  const repositoryAdapter = createMoneyPostingRepository(workflowRepository);
  return createPostMoneyMovementUseCase(repositoryAdapter);
};
