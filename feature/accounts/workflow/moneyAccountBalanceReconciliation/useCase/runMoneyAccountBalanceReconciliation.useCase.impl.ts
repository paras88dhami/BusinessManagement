import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import {
  MoneyAccountValidationError,
} from "@/feature/accounts/types/moneyAccount.types";
import {
  TransactionDirection,
  TransactionSourceModule,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import { PostMoneyMovementUseCase } from "@/feature/transactions/useCase/postMoneyMovement.useCase";
import { RunMoneyAccountBalanceReconciliationWorkflowUseCase } from "./runMoneyAccountBalanceReconciliation.useCase";
import {
  MONEY_ACCOUNT_BALANCE_CORRECTION_CATEGORY,
  MONEY_ACCOUNT_BALANCE_RECONCILIATION_SOURCE_ACTION,
  RunMoneyAccountBalanceReconciliationWorkflowInput,
} from "../types/moneyAccountBalanceReconciliation.types";

const normalizeRequired = (value: string): string => value.trim();

const roundToCurrencyScale = (value: number): number => {
  return Number(value.toFixed(2));
};

const createTransactionRemoteId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `txn-money-account-${randomId}`;
  }

  return `txn-money-account-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const buildAuditNote = ({
  reason,
  currentBalance,
  targetBalance,
}: {
  reason: string;
  currentBalance: number;
  targetBalance: number;
}): string => {
  return [
    `Reason: ${reason}`,
    `Previous balance: ${currentBalance.toFixed(2)}`,
    `Corrected balance: ${targetBalance.toFixed(2)}`,
  ].join(" | ");
};

const sanitizeIdempotencySegment = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 48);
};

const buildReconciliationIdempotencyKey = ({
  moneyAccountRemoteId,
  adjustedAt,
  targetBalance,
  reason,
}: {
  moneyAccountRemoteId: string;
  adjustedAt: number;
  targetBalance: number;
  reason: string;
}): string => {
  return [
    "money-account",
    moneyAccountRemoteId,
    "reconciliation",
    String(adjustedAt),
    targetBalance.toFixed(2),
    sanitizeIdempotencySegment(reason),
  ].join(":");
};

type CreateRunMoneyAccountBalanceReconciliationWorkflowUseCaseParams =
  {
    moneyAccountRepository: MoneyAccountRepository;
    postMoneyMovementUseCase: PostMoneyMovementUseCase;
  };

export const createRunMoneyAccountBalanceReconciliationWorkflowUseCase =
  ({
    moneyAccountRepository,
    postMoneyMovementUseCase,
  }: CreateRunMoneyAccountBalanceReconciliationWorkflowUseCaseParams): RunMoneyAccountBalanceReconciliationWorkflowUseCase => ({
    async execute(
      payload: RunMoneyAccountBalanceReconciliationWorkflowInput,
    ) {
      const ownerUserRemoteId = normalizeRequired(
        payload.ownerUserRemoteId,
      );
      const scopeAccountRemoteId = normalizeRequired(
        payload.scopeAccountRemoteId,
      );
      const scopeAccountDisplayNameSnapshot = normalizeRequired(
        payload.scopeAccountDisplayNameSnapshot,
      );
      const moneyAccountRemoteId = normalizeRequired(
        payload.moneyAccountRemoteId,
      );
      const reason = normalizeRequired(payload.reason);

      if (!ownerUserRemoteId) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "User context is required.",
          ),
        };
      }

      if (!scopeAccountRemoteId) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Account context is required.",
          ),
        };
      }

      if (!scopeAccountDisplayNameSnapshot) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Account label is required.",
          ),
        };
      }

      if (!moneyAccountRemoteId) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Money account is required.",
          ),
        };
      }

      if (
        !Number.isFinite(payload.targetBalance) ||
        payload.targetBalance < 0
      ) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Correct balance must be zero or greater.",
          ),
        };
      }

      if (!reason) {
        return {
          success: false,
          error: MoneyAccountValidationError("Reason is required."),
        };
      }

      if (
        !Number.isFinite(payload.adjustedAt) ||
        payload.adjustedAt <= 0
      ) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Correction date is required.",
          ),
        };
      }

      const accountResult =
        await moneyAccountRepository.getMoneyAccountByRemoteId(
          moneyAccountRemoteId,
        );

      if (!accountResult.success) {
        return accountResult;
      }

      const moneyAccount = accountResult.value;

      if (moneyAccount.scopeAccountRemoteId !== scopeAccountRemoteId) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Money account does not belong to this workspace.",
          ),
        };
      }

      if (!moneyAccount.isActive) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Money account is not active.",
          ),
        };
      }

      const targetBalance = roundToCurrencyScale(payload.targetBalance);
      const currentBalance = roundToCurrencyScale(
        moneyAccount.currentBalance,
      );
      const delta = roundToCurrencyScale(
        targetBalance - currentBalance,
      );

      if (Math.abs(delta) < 0.000001) {
        return {
          success: false,
          error: MoneyAccountValidationError(
            "Balance already matches.",
          ),
        };
      }

      const postResult = await postMoneyMovementUseCase.execute({
        remoteId: createTransactionRemoteId(),
        ownerUserRemoteId,
        accountRemoteId: scopeAccountRemoteId,
        accountDisplayNameSnapshot: scopeAccountDisplayNameSnapshot,
        transactionType:
          delta > 0 ? TransactionType.Income : TransactionType.Expense,
        direction:
          delta > 0
            ? TransactionDirection.In
            : TransactionDirection.Out,
        title: `Balance correction - ${moneyAccount.name}`,
        amount: Math.abs(delta),
        currencyCode: moneyAccount.currencyCode,
        categoryLabel: MONEY_ACCOUNT_BALANCE_CORRECTION_CATEGORY,
        note: buildAuditNote({
          reason,
          currentBalance,
          targetBalance,
        }),
        happenedAt: payload.adjustedAt,
        settlementMoneyAccountRemoteId: moneyAccount.remoteId,
        settlementMoneyAccountDisplayNameSnapshot: moneyAccount.name,
        sourceModule: TransactionSourceModule.MoneyAccounts,
        sourceRemoteId: moneyAccount.remoteId,
        sourceAction:
          MONEY_ACCOUNT_BALANCE_RECONCILIATION_SOURCE_ACTION,
        idempotencyKey: buildReconciliationIdempotencyKey({
          moneyAccountRemoteId: moneyAccount.remoteId,
          adjustedAt: payload.adjustedAt,
          targetBalance,
          reason,
        }),
      });

      if (!postResult.success) {
        return {
          success: false,
          error: MoneyAccountValidationError(postResult.error.message),
        };
      }

      return moneyAccountRepository.getMoneyAccountByRemoteId(
        moneyAccount.remoteId,
      );
    },
  });
