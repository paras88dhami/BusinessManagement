import { BudgetRepository } from "@/feature/budget/data/repository/budget.repository";
import { BudgetValidationError } from "@/feature/budget/types/budget.types";
import { DeleteBudgetPlanUseCase } from "./deleteBudgetPlan.useCase";

export const createDeleteBudgetPlanUseCase = (
  repository: BudgetRepository,
): DeleteBudgetPlanUseCase => ({
  async execute(remoteId) {
    if (!remoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Budget remote id is required."),
      };
    }

    return repository.deleteBudgetPlanByRemoteId(remoteId);
  },
});
