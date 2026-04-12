import { Result } from "@/shared/types/result.types";
import {
  SaveTransactionPayload,
} from "@/feature/transactions/types/transaction.entity.types";
import { TransactionModel } from "./db/transaction.model";

export interface MoneyPostingDatasource {
  postMoneyMovement(
    payload: SaveTransactionPayload,
  ): Promise<Result<TransactionModel>>;
  deleteMoneyMovementByRemoteId(remoteId: string): Promise<Result<boolean>>;
}
