import { createLocalBudgetDatasource } from "@/feature/budget/data/dataSource/local.budget.datasource.impl";
import { createBudgetRepository } from "@/feature/budget/data/repository/budget.repository.impl";
import { BudgetScreen } from "@/feature/budget/ui/BudgetScreen";
import { createCreateBudgetPlanUseCase } from "@/feature/budget/useCase/createBudgetPlan.useCase.impl";
import { createDeleteBudgetPlanUseCase } from "@/feature/budget/useCase/deleteBudgetPlan.useCase.impl";
import { createGetBudgetPlanByRemoteIdUseCase } from "@/feature/budget/useCase/getBudgetPlanByRemoteId.useCase.impl";
import { createGetBudgetPlansUseCase } from "@/feature/budget/useCase/getBudgetPlans.useCase.impl";
import { createUpdateBudgetPlanUseCase } from "@/feature/budget/useCase/updateBudgetPlan.useCase.impl";
import { useBudgetViewModel } from "@/feature/budget/viewModel/budget.viewModel.impl";
import { createLocalCategoryDatasource } from "@/feature/categories/data/dataSource/local.category.datasource.impl";
import { createCategoryRepository } from "@/feature/categories/data/repository/category.repository.impl";
import { createGetCategoriesUseCase } from "@/feature/categories/useCase/getCategories.useCase.impl";
import { createLocalTransactionDatasource } from "@/feature/transactions/data/dataSource/local.transaction.datasource.impl";
import { createTransactionRepository } from "@/feature/transactions/data/repository/transaction.repository.impl";
import { createGetTransactionsUseCase } from "@/feature/transactions/useCase/getTransactions.useCase.impl";
import appDatabase from "@/shared/database/appDatabase";
import React, { useMemo } from "react";

export type GetBudgetScreenFactoryProps = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
};

export function GetBudgetScreenFactory({
  activeUserRemoteId,
  activeAccountRemoteId,
  activeAccountCurrencyCode,
  activeAccountCountryCode,
}: GetBudgetScreenFactoryProps) {
  const budgetDatasource = useMemo(
    () => createLocalBudgetDatasource(appDatabase),
    [],
  );
  const budgetRepository = useMemo(
    () => createBudgetRepository(budgetDatasource),
    [budgetDatasource],
  );
  const getBudgetPlansUseCase = useMemo(
    () => createGetBudgetPlansUseCase(budgetRepository),
    [budgetRepository],
  );
  const getBudgetPlanByRemoteIdUseCase = useMemo(
    () => createGetBudgetPlanByRemoteIdUseCase(budgetRepository),
    [budgetRepository],
  );
  const createBudgetPlanUseCase = useMemo(
    () => createCreateBudgetPlanUseCase(budgetRepository),
    [budgetRepository],
  );
  const updateBudgetPlanUseCase = useMemo(
    () => createUpdateBudgetPlanUseCase(budgetRepository),
    [budgetRepository],
  );
  const deleteBudgetPlanUseCase = useMemo(
    () => createDeleteBudgetPlanUseCase(budgetRepository),
    [budgetRepository],
  );

  const categoryDatasource = useMemo(
    () => createLocalCategoryDatasource(appDatabase),
    [],
  );
  const categoryRepository = useMemo(
    () => createCategoryRepository(categoryDatasource),
    [categoryDatasource],
  );
  const getCategoriesUseCase = useMemo(
    () => createGetCategoriesUseCase(categoryRepository),
    [categoryRepository],
  );

  const transactionDatasource = useMemo(
    () => createLocalTransactionDatasource(appDatabase),
    [],
  );
  const transactionRepository = useMemo(
    () => createTransactionRepository(transactionDatasource),
    [transactionDatasource],
  );
  const getTransactionsUseCase = useMemo(
    () => createGetTransactionsUseCase(transactionRepository),
    [transactionRepository],
  );

  const viewModel = useBudgetViewModel({
    ownerUserRemoteId: activeUserRemoteId,
    accountRemoteId: activeAccountRemoteId,
    currencyCode: activeAccountCurrencyCode,
    countryCode: activeAccountCountryCode,
    getBudgetPlansUseCase,
    getBudgetPlanByRemoteIdUseCase,
    createBudgetPlanUseCase,
    updateBudgetPlanUseCase,
    deleteBudgetPlanUseCase,
    getCategoriesUseCase,
    getTransactionsUseCase,
  });

  return <BudgetScreen viewModel={viewModel} />;
}
