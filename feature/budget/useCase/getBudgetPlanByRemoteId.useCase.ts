import { BudgetPlanResult } from "@/feature/budget/types/budget.types";

export interface GetBudgetPlanByRemoteIdUseCase {
  execute(remoteId: string): Promise<BudgetPlanResult>;
}
