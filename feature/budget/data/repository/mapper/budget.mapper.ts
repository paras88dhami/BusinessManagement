import { BudgetPlanModel } from "@/feature/budget/data/dataSource/db/budgetPlan.model";
import { BudgetPlan } from "@/feature/budget/types/budget.types";

export const mapBudgetPlanModelToDomain = (
  model: BudgetPlanModel,
): BudgetPlan => ({
  remoteId: model.remoteId,
  ownerUserRemoteId: model.ownerUserRemoteId,
  accountRemoteId: model.accountRemoteId,
  budgetMonth: model.budgetMonth,
  categoryRemoteId: model.categoryRemoteId,
  categoryNameSnapshot: model.categoryNameSnapshot,
  currencyCode: model.currencyCode,
  plannedAmount: model.plannedAmount,
  note: model.note,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});
