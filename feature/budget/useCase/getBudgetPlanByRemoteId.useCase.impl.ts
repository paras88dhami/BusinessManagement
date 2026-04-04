import { BudgetRepository } from "@/feature/budget/data/repository/budget.repository";
import { BudgetValidationError } from "@/feature/budget/types/budget.types";
import { GetBudgetPlanByRemoteIdUseCase } from "./getBudgetPlanByRemoteId.useCase";

export const createGetBudgetPlanByRemoteIdUseCase = (
  repository: BudgetRepository,
): GetBudgetPlanByRemoteIdUseCase => ({
  async execute(remoteId) {
    if (!remoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Budget remote id is required."),
      };
    }

    return repository.getBudgetPlanByRemoteId(remoteId);
  },
});
