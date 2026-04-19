import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import { TransactionPostingStatus } from "@/feature/transactions/types/transaction.entity.types";
import {
  DeleteMoneyPostingMode,
  PostMoneyPostingMode,
} from "../types/moneyPostingWorkflow.types";

export const resolvePostMoneyPostingMode = ({
  existingByRemoteId,
  existingByIdempotencyKey,
}: {
  existingByRemoteId: TransactionModel | null;
  existingByIdempotencyKey: TransactionModel | null;
}): PostMoneyPostingMode => {
  if (!existingByRemoteId && existingByIdempotencyKey) {
    return "idempotent_return";
  }

  return existingByRemoteId ? "update" : "create";
};

export const resolveDeleteMoneyPostingMode = ({
  existing,
}: {
  existing: TransactionModel | null;
}): DeleteMoneyPostingMode => {
  if (!existing) {
    return "not_found";
  }

  if (
    existing.deletedAt !== null &&
    existing.postingStatus !== TransactionPostingStatus.Voided
  ) {
    return "already_deleted_not_voided";
  }

  if (existing.postingStatus === TransactionPostingStatus.Voided) {
    return "already_voided";
  }

  return "void";
};
