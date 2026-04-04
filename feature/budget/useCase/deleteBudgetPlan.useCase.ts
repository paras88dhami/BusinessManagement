import { BudgetOperationResult } from "@/feature/budget/types/budget.types";

export interface DeleteBudgetPlanUseCase {
  execute(remoteId: string): Promise<BudgetOperationResult>;
}
