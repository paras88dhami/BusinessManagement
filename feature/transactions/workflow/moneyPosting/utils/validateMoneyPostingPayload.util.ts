import {
  SaveTransactionPayload,
  TransactionDirection,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";

export const validateMoneyPostingPayload = (
  payload: SaveTransactionPayload,
): string | null => {
  if (!payload.remoteId) {
    return "Transaction id is required.";
  }

  if (!payload.ownerUserRemoteId) {
    return "User context is required.";
  }

  if (!payload.accountRemoteId) {
    return "Active account is required.";
  }

  if (!payload.accountDisplayNameSnapshot) {
    return "Account display name is required.";
  }

  if (!payload.title) {
    return "Transaction title is required.";
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return "Amount must be greater than zero.";
  }

  if (!Number.isFinite(payload.happenedAt) || payload.happenedAt <= 0) {
    return "Transaction date is required.";
  }

  if (
    payload.transactionType === TransactionType.Income &&
    payload.direction !== TransactionDirection.In
  ) {
    return "Income must move money in.";
  }

  if (
    payload.transactionType === TransactionType.Expense &&
    payload.direction !== TransactionDirection.Out
  ) {
    return "Expense must move money out.";
  }

  return null;
};
