import { Result } from "@/shared/types/result.types";
import { TransactionModel } from "./db/transaction.model";

export interface TransactionDatasource {
  getTransactionsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<Result<TransactionModel[]>>;
  getTransactionByRemoteId(
    remoteId: string,
  ): Promise<Result<TransactionModel | null>>;
}
