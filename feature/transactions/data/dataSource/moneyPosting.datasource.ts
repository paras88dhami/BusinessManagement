import { Result } from "@/shared/types/result.types";
import {
  SaveTransactionPayload,
  TransactionPostingStatusValue,
} from "@/feature/transactions/types/transaction.entity.types";
import { TransactionModel } from "./db/transaction.model";

export interface MoneyPostingDatasource {
  getTransactionByRemoteId(
    remoteId: string,
  ): Promise<Result<TransactionModel | null>>;
  getActiveTransactionByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Result<TransactionModel | null>>;
  runInTransaction<T>(operation: () => Promise<T>): Promise<Result<T>>;
  createTransaction(
    payload: SaveTransactionPayload,
    postingStatus: TransactionPostingStatusValue,
  ): Promise<Result<TransactionModel>>;
  updateTransaction(
    existing: TransactionModel,
    payload: SaveTransactionPayload,
    postingStatus: TransactionPostingStatusValue,
  ): Promise<Result<TransactionModel>>;
  markTransactionVoided(
    existing: TransactionModel,
  ): Promise<Result<TransactionModel>>;
}
