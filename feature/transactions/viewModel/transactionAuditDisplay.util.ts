import {
  Transaction,
  TransactionPostingStatus,
  TransactionSourceModule,
  TransactionSourceModuleValue,
  TransactionType,
  TransactionTypeValue,
} from "@/feature/transactions/types/transaction.entity.types";

const humanizeAction = (value: string): string => {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getTransactionSourceLabel = (
  sourceModule: TransactionSourceModuleValue,
): string => {
  switch (sourceModule) {
    case TransactionSourceModule.MoneyAccounts:
      return "Money Accounts";
    case TransactionSourceModule.Ledger:
      return "Ledger";
    case TransactionSourceModule.Billing:
      return "Billing";
    case TransactionSourceModule.Pos:
      return "POS";
    case TransactionSourceModule.Emi:
      return "EMI";
    case TransactionSourceModule.Orders:
      return "Orders";
    default:
      return "Manual";
  }
};

export const getTransactionTypeLabel = (
  transactionType: TransactionTypeValue,
): string => {
  switch (transactionType) {
    case TransactionType.Income:
      return "Income";
    case TransactionType.Expense:
      return "Expense";
    case TransactionType.Transfer:
      return "Transfer";
    case TransactionType.Refund:
      return "Refund";
    default:
      return "Transaction";
  }
};

export const getTransactionActionLabel = (
  transaction: Transaction,
): string | null => {
  const sourceAction = transaction.sourceAction?.trim() ?? "";

  if (!sourceAction) {
    return null;
  }

  switch (sourceAction) {
    case "opening_balance":
      return "Opening Balance";
    case "balance_reconciliation":
      return "Balance Correction";
    case "document_payment":
      return "Document Payment";
    case "installment_payment":
      return "EMI Payment";
    case "checkout_payment":
      return "POS Payment";
    case "settlement":
      return "Settlement";
    case "payment":
      return "Payment";
    case "refund":
      return "Refund";
    default:
      return humanizeAction(sourceAction);
  }
};

export const getTransactionStatusLabel = (transaction: Transaction): string => {
  return transaction.postingStatus === TransactionPostingStatus.Voided
    ? "Voided"
    : "Posted";
};

export const getTransactionStatementLabel = (
  transaction: Transaction,
): string => {
  return getTransactionActionLabel(transaction) ?? getTransactionTypeLabel(
    transaction.transactionType,
  );
};
