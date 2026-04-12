import {
  TransactionResult,
  TransactionsResult,
} from "@/feature/transactions/types/transaction.entity.types";

export interface TransactionRepository {
  getTransactionsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<TransactionsResult>;
  getTransactionByRemoteId(remoteId: string): Promise<TransactionResult>;
}
