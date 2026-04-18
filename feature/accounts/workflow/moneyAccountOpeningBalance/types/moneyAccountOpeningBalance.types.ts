import {
  MoneyAccountResult,
  SaveMoneyAccountPayload,
} from "@/feature/accounts/types/moneyAccount.types";

export type RunMoneyAccountOpeningBalanceWorkflowInput =
  SaveMoneyAccountPayload;

export type RunMoneyAccountOpeningBalanceWorkflowResult =
  MoneyAccountResult;

export const MONEY_ACCOUNT_OPENING_BALANCE_SOURCE_ACTION =
  "opening_balance";

export const MONEY_ACCOUNT_OPENING_BALANCE_CATEGORY =
  "Opening Balance";
