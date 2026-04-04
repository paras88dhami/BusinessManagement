import { BudgetPlansResult } from "@/feature/budget/types/budget.types";

export type GetBudgetPlansParams = {
  ownerUserRemoteId: string;
  accountRemoteId: string;
};

export interface GetBudgetPlansUseCase {
  execute(params: GetBudgetPlansParams): Promise<BudgetPlansResult>;
}
