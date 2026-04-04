import {
  BudgetPlanResult,
  SaveBudgetPlanPayload,
} from "@/feature/budget/types/budget.types";

export interface UpdateBudgetPlanUseCase {
  execute(payload: SaveBudgetPlanPayload): Promise<BudgetPlanResult>;
}
