import { SaveTransactionPayload } from "@/feature/transactions/types/transaction.entity.types";
import { Result } from "@/shared/types/result.types";
import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";

export interface RunMoneyPostingWorkflowUseCase {
  postMoneyMovement(
    payload: SaveTransactionPayload,
  ): Promise<Result<TransactionModel>>;
  deleteMoneyMovementByRemoteId(remoteId: string): Promise<Result<boolean>>;
}
