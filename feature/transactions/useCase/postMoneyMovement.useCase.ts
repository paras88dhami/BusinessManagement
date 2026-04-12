import {
  SaveTransactionPayload,
  TransactionResult,
} from "@/feature/transactions/types/transaction.entity.types";

export interface PostMoneyMovementUseCase {
  execute(payload: SaveTransactionPayload): Promise<TransactionResult>;
}
