import {
  AdjustMoneyAccountBalancePayload,
  MoneyAccountResult,
} from "@/feature/accounts/types/moneyAccount.types";

export type RunMoneyAccountBalanceReconciliationWorkflowInput =
  AdjustMoneyAccountBalancePayload;

export type RunMoneyAccountBalanceReconciliationWorkflowResult =
  MoneyAccountResult;

export const MONEY_ACCOUNT_BALANCE_RECONCILIATION_SOURCE_ACTION =
  "balance_reconciliation";

export const MONEY_ACCOUNT_BALANCE_CORRECTION_CATEGORY =
  "Balance Correction";
