import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import {
  AdjustMoneyAccountBalancePayload,
  MoneyAccountResult,
  MoneyAccountValidationError,
} from "@/feature/accounts/types/moneyAccount.types";
import {
  TransactionDirection,
  TransactionSourceModule,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import { PostMoneyMovementUseCase } from "@/feature/transactions/useCase/postMoneyMovement.useCase";
import { AdjustMoneyAccountBalanceUseCase } from "./adjustMoneyAccountBalance.useCase";

const BALANCE_RECONCILIATION_SOURCE_ACTION = "balance_reconciliation";
const BALANCE_CORRECTION_CATEGORY = "Balance Correction";

const createTransactionRemoteId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `txn-money-account-${randomId}`;
  }

  return `txn-money-account-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const roundToCurrencyScale = (value: number): number => {
  return Number(value.toFixed(2));
};

const normalizeRequired = (value: string): string => value.trim();

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

export const createAdjustMoneyAccountBalanceUseCase = ({
  moneyAccountRepository,
  postMoneyMovementUseCase,
}: {
  moneyAccountRepository: MoneyAccountRepository;
  postMoneyMovementUseCase: PostMoneyMovementUseCase;
}): AdjustMoneyAccountBalanceUseCase => ({
  async execute(
    payload: AdjustMoneyAccountBalancePayload,
  ): Promise<MoneyAccountResult> {
    const ownerUserRemoteId = normalizeRequired(payload.ownerUserRemoteId);
    const scopeAccountRemoteId = normalizeRequired(payload.scopeAccountRemoteId);
    const scopeAccountDisplayNameSnapshot = normalizeRequired(
      payload.scopeAccountDisplayNameSnapshot,
    );
    const moneyAccountRemoteId = normalizeRequired(payload.moneyAccountRemoteId);
    const reason = normalizeRequired(payload.reason);

    if (!ownerUserRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("User context is required."),
      };
    }

    if (!scopeAccountRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("Account context is required."),
      };
    }

    if (!scopeAccountDisplayNameSnapshot) {
      return {
        success: false,
        error: MoneyAccountValidationError("Account label is required."),
      };
    }

    if (!moneyAccountRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("Money account is required."),
      };
    }

    if (!Number.isFinite(payload.targetBalance) || payload.targetBalance < 0) {
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

    if (!Number.isFinite(payload.adjustedAt) || payload.adjustedAt <= 0) {
      return {
        success: false,
        error: MoneyAccountValidationError("Correction date is required."),
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
        error: MoneyAccountValidationError("Money account is not active."),
      };
    }

    const targetBalance = roundToCurrencyScale(payload.targetBalance);
    const currentBalance = roundToCurrencyScale(moneyAccount.currentBalance);
    const delta = roundToCurrencyScale(targetBalance - currentBalance);

    if (Math.abs(delta) < 0.000001) {
      return {
        success: false,
        error: MoneyAccountValidationError("Balance already matches."),
      };
    }

    const transactionRemoteId = createTransactionRemoteId();
    const postResult = await postMoneyMovementUseCase.execute({
      remoteId: transactionRemoteId,
      ownerUserRemoteId,
      accountRemoteId: scopeAccountRemoteId,
      accountDisplayNameSnapshot: scopeAccountDisplayNameSnapshot,
      transactionType: delta > 0 ? TransactionType.Income : TransactionType.Expense,
      direction: delta > 0 ? TransactionDirection.In : TransactionDirection.Out,
      title: `Balance correction - ${moneyAccount.name}`,
      amount: Math.abs(delta),
      currencyCode: moneyAccount.currencyCode,
      categoryLabel: BALANCE_CORRECTION_CATEGORY,
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
      sourceAction: BALANCE_RECONCILIATION_SOURCE_ACTION,
      idempotencyKey: `money-account:${moneyAccount.remoteId}:reconciliation:${transactionRemoteId}`,
    });

    if (!postResult.success) {
      return {
        success: false,
        error: MoneyAccountValidationError(postResult.error.message),
      };
    }

    return moneyAccountRepository.getMoneyAccountByRemoteId(moneyAccount.remoteId);
  },
});
