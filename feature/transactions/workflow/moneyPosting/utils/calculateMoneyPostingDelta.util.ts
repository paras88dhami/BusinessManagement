import { TransactionModel } from "@/feature/transactions/data/dataSource/db/transaction.model";
import {
  SaveTransactionPayload,
  TransactionDirection,
  TransactionDirectionValue,
  TransactionPostingStatus,
  TransactionPostingStatusValue,
} from "@/feature/transactions/types/transaction.entity.types";
import {
  DeleteMoneyPostingCalculation,
  PostMoneyPostingCalculation,
} from "../types/moneyPostingWorkflow.types";

const resolvePostingStatus = (
  postingStatus?: TransactionPostingStatusValue | null,
): TransactionPostingStatusValue => {
  return postingStatus ?? TransactionPostingStatus.Posted;
};

const toSignedAmount = (
  amount: number,
  direction: TransactionDirectionValue,
): number => {
  return direction === TransactionDirection.In ? amount : amount * -1;
};

const toPostedSignedAmount = ({
  amount,
  direction,
  postingStatus,
}: {
  amount: number;
  direction: TransactionDirectionValue;
  postingStatus: TransactionPostingStatusValue | null | undefined;
}): number => {
  return resolvePostingStatus(postingStatus) === TransactionPostingStatus.Posted
    ? toSignedAmount(amount, direction)
    : 0;
};

export const calculatePostMoneyPostingDelta = ({
  existingByRemoteId,
  payload,
}: {
  existingByRemoteId: TransactionModel | null;
  payload: SaveTransactionPayload;
}): PostMoneyPostingCalculation => {
  const nextPostingStatus = resolvePostingStatus(payload.postingStatus);
  const nextSignedAmount =
    nextPostingStatus === TransactionPostingStatus.Posted
      ? toSignedAmount(payload.amount, payload.direction)
      : 0;

  if (existingByRemoteId) {
    const previousSignedAmount = toPostedSignedAmount({
      amount: existingByRemoteId.amount,
      direction: existingByRemoteId.direction,
      postingStatus: existingByRemoteId.postingStatus,
    });

    return {
      postingStatus: nextPostingStatus,
      balanceAdjustments: [
        {
          moneyAccountRemoteId: existingByRemoteId.settlementMoneyAccountRemoteId,
          delta: previousSignedAmount * -1,
        },
        {
          moneyAccountRemoteId: payload.settlementMoneyAccountRemoteId ?? null,
          delta: nextSignedAmount,
        },
      ],
    };
  }

  return {
    postingStatus: nextPostingStatus,
    balanceAdjustments: [
      {
        moneyAccountRemoteId: payload.settlementMoneyAccountRemoteId ?? null,
        delta: nextSignedAmount,
      },
    ],
  };
};

export const calculateDeleteMoneyPostingDelta = ({
  existing,
}: {
  existing: TransactionModel;
}): DeleteMoneyPostingCalculation => {
  const signedAmount = toPostedSignedAmount({
    amount: existing.amount,
    direction: existing.direction,
    postingStatus: existing.postingStatus,
  });

  return {
    balanceAdjustments: [
      {
        moneyAccountRemoteId: existing.settlementMoneyAccountRemoteId,
        delta: signedAmount * -1,
      },
    ],
  };
};
