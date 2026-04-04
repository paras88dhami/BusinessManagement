import { BudgetRepository } from "@/feature/budget/data/repository/budget.repository";
import {
  BudgetValidationError,
  DuplicateBudgetError,
  SaveBudgetPlanPayload,
} from "@/feature/budget/types/budget.types";
import { CreateBudgetPlanUseCase } from "./createBudgetPlan.useCase";

const isValidBudgetMonth = (value: string): boolean => /^\d{4}-\d{2}$/.test(value);

export const createCreateBudgetPlanUseCase = (
  repository: BudgetRepository,
): CreateBudgetPlanUseCase => ({
  async execute(payload: SaveBudgetPlanPayload) {
    if (!payload.remoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Budget remote id is required."),
      };
    }

    if (!payload.ownerUserRemoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("User context is required."),
      };
    }

    if (!payload.accountRemoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Account context is required."),
      };
    }

    if (!isValidBudgetMonth(payload.budgetMonth.trim())) {
      return {
        success: false,
        error: BudgetValidationError("Budget month must use YYYY-MM format."),
      };
    }

    if (!payload.categoryRemoteId.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Budget category is required."),
      };
    }

    if (!payload.categoryNameSnapshot.trim()) {
      return {
        success: false,
        error: BudgetValidationError("Budget category label is required."),
      };
    }

    if (!Number.isFinite(payload.plannedAmount) || payload.plannedAmount <= 0) {
      return {
        success: false,
        error: BudgetValidationError("Planned amount must be greater than zero."),
      };
    }

    const existingBudgets = await repository.getBudgetPlansByAccountRemoteId(
      payload.accountRemoteId,
    );

    if (!existingBudgets.success) {
      return existingBudgets;
    }

    const duplicateBudget = existingBudgets.value.find(
      (budgetPlan) =>
        budgetPlan.budgetMonth === payload.budgetMonth.trim() &&
        budgetPlan.categoryRemoteId === payload.categoryRemoteId.trim(),
    );

    if (duplicateBudget) {
      return {
        success: false,
        error: DuplicateBudgetError(
          payload.categoryNameSnapshot.trim(),
          payload.budgetMonth.trim(),
        ),
      };
    }

    return repository.createBudgetPlan({
      ...payload,
      budgetMonth: payload.budgetMonth.trim(),
      categoryRemoteId: payload.categoryRemoteId.trim(),
      categoryNameSnapshot: payload.categoryNameSnapshot.trim(),
    });
  },
});
