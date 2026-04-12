import { TransactionOperationResult } from "@/feature/transactions/types/transaction.entity.types";

export interface DeleteMoneyMovementUseCase {
  execute(remoteId: string): Promise<TransactionOperationResult>;
}
