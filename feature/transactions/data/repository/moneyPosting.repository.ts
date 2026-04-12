import {
  SaveTransactionPayload,
  TransactionOperationResult,
  TransactionResult,
} from "@/feature/transactions/types/transaction.entity.types";

export interface MoneyPostingRepository {
  postMoneyMovement(payload: SaveTransactionPayload): Promise<TransactionResult>;
  deleteMoneyMovementByRemoteId(
    remoteId: string,
  ): Promise<TransactionOperationResult>;
}
