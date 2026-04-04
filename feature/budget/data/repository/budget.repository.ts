import {
  BudgetOperationResult,
  BudgetPlanResult,
  BudgetPlansResult,
  SaveBudgetPlanPayload,
} from "@/feature/budget/types/budget.types";

export interface BudgetRepository {
  getBudgetPlansByAccountRemoteId(accountRemoteId: string): Promise<BudgetPlansResult>;
  getBudgetPlanByRemoteId(remoteId: string): Promise<BudgetPlanResult>;
  createBudgetPlan(payload: SaveBudgetPlanPayload): Promise<BudgetPlanResult>;
  updateBudgetPlan(payload: SaveBudgetPlanPayload): Promise<BudgetPlanResult>;
  deleteBudgetPlanByRemoteId(remoteId: string): Promise<BudgetOperationResult>;
}
