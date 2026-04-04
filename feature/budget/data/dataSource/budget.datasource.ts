import { SaveBudgetPlanPayload } from "@/feature/budget/types/budget.types";
import { Result } from "@/shared/types/result.types";
import { BudgetPlanModel } from "./db/budgetPlan.model";

export interface BudgetDatasource {
  saveBudgetPlan(payload: SaveBudgetPlanPayload): Promise<Result<BudgetPlanModel>>;
  getBudgetPlansByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<BudgetPlanModel[]>>;
  getBudgetPlanByRemoteId(
    remoteId: string,
  ): Promise<Result<BudgetPlanModel | null>>;
  deleteBudgetPlanByRemoteId(remoteId: string): Promise<Result<boolean>>;
}
