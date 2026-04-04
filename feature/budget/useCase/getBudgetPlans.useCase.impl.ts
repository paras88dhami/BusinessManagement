import { BudgetRepository } from "@/feature/budget/data/repository/budget.repository";
import { BudgetValidationError } from "@/feature/budget/types/budget.types";
import { GetBudgetPlansUseCase } from "./getBudgetPlans.useCase";

export const createGetBudgetPlansUseCase = (
  repository: BudgetRepository,
): GetBudgetPlansUseCase => ({
  async execute(params) {
    if (!params.ownerUserRemoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("User context is required."),
      };
    }

    if (!params.accountRemoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Account context is required."),
      };
    }

    return repository.getBudgetPlansByAccountRemoteId(params.accountRemoteId);
  },
});
