import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import {
  SaveTransactionPayload,
  TransactionPostingStatusValue,
} from "@/feature/transactions/types/transaction.entity.types";
import {
  calculateDeleteMoneyPostingDelta,
  calculatePostMoneyPostingDelta,
} from "./calculateMoneyPostingDelta.util";
import {
  resolveDeleteMoneyPostingMode,
  resolvePostMoneyPostingMode,
} from "./resolveMoneyPostingMode.util";
import {
  DeleteMoneyMovementWorkflowExecution,
  MoneyPostingBalanceAdjustment,
  MoneyPostingWorkflowPlan,
  PostMoneyMovementWorkflowExecution,
} from "../types/moneyPostingWorkflow.types";

export const buildPostMoneyPostingPlan = ({
  existingByRemoteId,
  existingByIdempotencyKey,
  payload,
}: {
  existingByRemoteId: TransactionModel | null;
  existingByIdempotencyKey: TransactionModel | null;
  payload: SaveTransactionPayload;
}): PostMoneyMovementWorkflowExecution => {
  const mode = resolvePostMoneyPostingMode({
    existingByRemoteId,
    existingByIdempotencyKey,
  });

  if (mode === "idempotent_return") {
    if (!existingByIdempotencyKey) {
      throw new Error("Idempotency workflow resolved without matching record.");
    }

    return {
      kind: "plan",
      plan: {
        mode,
        normalizedPayload: payload,
        existingTransaction: existingByIdempotencyKey,
        transactionMutation: {
          kind: "return_existing",
        },
        balanceAdjustments: [],
      },
    };
  }

  const calculation = calculatePostMoneyPostingDelta({
    existingByRemoteId,
    payload,
  });
  const balanceAdjustments = toWorkflowBalanceAdjustments(
    calculation.balanceAdjustments,
  );

  if (mode === "create") {
    return {
      kind: "plan",
      plan: toWorkflowPlan({
        mode,
        payload,
        existingTransaction: null,
        balanceAdjustments,
        postingStatus: calculation.postingStatus,
      }),
    };
  }

  if (!existingByRemoteId) {
    throw new Error("Missing existing transaction for update.");
  }

  return {
    kind: "plan",
    plan: toWorkflowPlan({
      mode,
      payload,
      existingTransaction: existingByRemoteId,
      balanceAdjustments,
      postingStatus: calculation.postingStatus,
    }),
  };
};

export const buildDeleteMoneyPostingPlan = ({
  existing,
}: {
  existing: TransactionModel | null;
}): DeleteMoneyMovementWorkflowExecution => {
  const mode = resolveDeleteMoneyPostingMode({ existing });

  if (mode === "not_found" || mode === "already_deleted_not_voided") {
    return {
      kind: "return_result",
      value: false,
    };
  }

  if (mode === "already_voided") {
    return {
      kind: "return_result",
      value: true,
    };
  }

  if (!existing) {
    throw new Error("Missing existing transaction for void workflow.");
  }

  const calculation = calculateDeleteMoneyPostingDelta({ existing });

  return {
    kind: "plan",
    plan: {
      mode: "void",
      normalizedPayload: null,
      existingTransaction: existing,
      transactionMutation: {
        kind: "void",
      },
      balanceAdjustments: toWorkflowBalanceAdjustments(
        calculation.balanceAdjustments,
      ),
    },
  };
};

const toWorkflowPlan = ({
  mode,
  payload,
  existingTransaction,
  balanceAdjustments,
  postingStatus,
}: {
  mode: "create" | "update";
  payload: SaveTransactionPayload;
  existingTransaction: TransactionModel | null;
  balanceAdjustments: readonly MoneyPostingBalanceAdjustment[];
  postingStatus: TransactionPostingStatusValue;
}): MoneyPostingWorkflowPlan => ({
  mode,
  normalizedPayload: payload,
  existingTransaction,
  transactionMutation: {
    kind: mode,
    postingStatus,
  },
  balanceAdjustments,
});

const toWorkflowBalanceAdjustments = (
  balanceAdjustments: readonly {
    moneyAccountRemoteId: string | null;
    delta: number;
  }[],
): readonly MoneyPostingBalanceAdjustment[] => {
  return balanceAdjustments
    .filter(
      (adjustment) =>
        Boolean(adjustment.moneyAccountRemoteId) &&
        Math.abs(adjustment.delta) >= 0.000001,
    )
    .map((adjustment) => ({
      moneyAccountRemoteId: adjustment.moneyAccountRemoteId as string,
      delta: adjustment.delta,
    }));
};
