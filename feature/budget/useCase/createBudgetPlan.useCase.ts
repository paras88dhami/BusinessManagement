import {
  BudgetPlanResult,
  SaveBudgetPlanPayload,
} from "@/feature/budget/types/budget.types";

export interface CreateBudgetPlanUseCase {
  execute(payload: SaveBudgetPlanPayload): Promise<BudgetPlanResult>;
}
