import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { Result } from "@/shared/types/result.types";
import {
  MoneyPostingWorkflowPlan,
} from "../types/moneyPostingWorkflow.types";

export interface MoneyPostingWorkflowRepository {
  getTransactionByRemoteId(
    remoteId: string,
  ): Promise<Result<TransactionModel | null>>;
  getActiveTransactionByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Result<TransactionModel | null>>;
  applyPostMoneyMovementPlan(
    plan: MoneyPostingWorkflowPlan,
  ): Promise<Result<TransactionModel>>;
  applyDeleteMoneyMovementPlan(
    plan: MoneyPostingWorkflowPlan,
  ): Promise<Result<boolean>>;
}
