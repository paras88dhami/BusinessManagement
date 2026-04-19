import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import {
  SaveTransactionPayload,
  TransactionDirectionValue,
  TransactionPostingStatusValue,
} from "@/feature/transactions/types/transaction.entity.types";

export type MoneyPostingSnapshot = {
  amount: number;
  direction: TransactionDirectionValue;
  settlementMoneyAccountRemoteId: string | null;
  postingStatus: TransactionPostingStatusValue | null | undefined;
  deletedAt: number | null;
};

export type MoneyPostingDraftBalanceAdjustment = {
  moneyAccountRemoteId: string | null;
  delta: number;
};

export type MoneyPostingBalanceAdjustment = {
  moneyAccountRemoteId: string;
  delta: number;
};

export type MoneyPostingWorkflowMode =
  | "create"
  | "update"
  | "idempotent_return"
  | "void";

export type MoneyPostingTransactionMutationPlan =
  | {
      kind: "create";
      postingStatus: TransactionPostingStatusValue;
    }
  | {
      kind: "update";
      postingStatus: TransactionPostingStatusValue;
    }
  | {
      kind: "void";
    }
  | {
      kind: "return_existing";
    };

export type MoneyPostingWorkflowPlan = {
  mode: MoneyPostingWorkflowMode;
  normalizedPayload: SaveTransactionPayload | null;
  existingTransaction: TransactionModel | null;
  transactionMutation: MoneyPostingTransactionMutationPlan;
  balanceAdjustments: readonly MoneyPostingBalanceAdjustment[];
};

export type PostMoneyPostingMode = Exclude<
  MoneyPostingWorkflowMode,
  "void"
>;
export type DeleteMoneyPostingMode =
  | "not_found"
  | "already_deleted_not_voided"
  | "already_voided"
  | "void";

export type PostMoneyPostingCalculation = {
  postingStatus: TransactionPostingStatusValue;
  balanceAdjustments: readonly MoneyPostingDraftBalanceAdjustment[];
};

export type DeleteMoneyPostingCalculation = {
  balanceAdjustments: readonly MoneyPostingDraftBalanceAdjustment[];
};

export type PostMoneyMovementWorkflowExecution = {
  kind: "plan";
  plan: MoneyPostingWorkflowPlan;
};

export type DeleteMoneyMovementWorkflowExecution =
  | {
      kind: "return_result";
      value: boolean;
    }
  | {
      kind: "plan";
      plan: MoneyPostingWorkflowPlan;
    };
