import {
  MONEY_ACCOUNT_TYPE_OPTIONS,
  MoneyAccountErrorType,
  MoneyAccountResult,
  MoneyAccountValidationError,
  SaveMoneyAccountPayload,
} from "@/feature/accounts/types/moneyAccount.types";
import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import {
  TransactionDirection,
  TransactionSourceModule,
  TransactionType,
} from "@/feature/transactions/types/transaction.entity.types";
import { PostMoneyMovementUseCase } from "@/feature/transactions/useCase/postMoneyMovement.useCase";
import { SaveMoneyAccountUseCase } from "./saveMoneyAccount.useCase";

const OPENING_BALANCE_SOURCE_ACTION = "opening_balance";
const OPENING_BALANCE_CATEGORY = "Opening Balance";

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const ALLOWED_TYPE_SET = new Set(
  MONEY_ACCOUNT_TYPE_OPTIONS.map((option) => option.value),
);

const createTransactionRemoteId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `txn-opening-${randomId}`;
  }

  return `txn-opening-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createSaveMoneyAccountUseCase = ({
  repository,
  postMoneyMovementUseCase,
}: {
  repository: MoneyAccountRepository;
  postMoneyMovementUseCase: PostMoneyMovementUseCase;
}): SaveMoneyAccountUseCase => ({
  async execute(payload: SaveMoneyAccountPayload) {
    const normalizedRemoteId = normalizeRequired(payload.remoteId);
    const normalizedOwnerUserRemoteId = normalizeRequired(payload.ownerUserRemoteId);
    const normalizedScopeAccountRemoteId = normalizeRequired(
      payload.scopeAccountRemoteId,
    );
    const normalizedScopeAccountDisplayNameSnapshot = normalizeOptional(
      payload.scopeAccountDisplayNameSnapshot ?? null,
    );
    const normalizedName = normalizeRequired(payload.name);

    if (!normalizedRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("Remote id is required."),
      };
    }

    if (!normalizedOwnerUserRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("Owner user remote id is required."),
      };
    }

    if (!normalizedScopeAccountRemoteId) {
      return {
        success: false,
        error: MoneyAccountValidationError("Scope account is required."),
      };
    }

    if (!normalizedName) {
      return {
        success: false,
        error: MoneyAccountValidationError("Account name is required."),
      };
    }

    if (!ALLOWED_TYPE_SET.has(payload.type)) {
      return {
        success: false,
        error: MoneyAccountValidationError("Account type is invalid."),
      };
    }

    const existingResult =
      await repository.getMoneyAccountByRemoteId(normalizedRemoteId);
    const existingAccount = existingResult.success ? existingResult.value : null;

    if (
      !existingResult.success &&
      existingResult.error.type !== MoneyAccountErrorType.MoneyAccountNotFound
    ) {
      return existingResult;
    }

    const isExistingAccount = existingAccount !== null;
    const openingBalance = payload.currentBalance;
    const nextCurrentBalance = existingAccount ? existingAccount.currentBalance : 0;

    if (!Number.isFinite(openingBalance)) {
      return {
        success: false,
        error: MoneyAccountValidationError("Opening balance is required."),
      };
    }

    if (openingBalance < 0) {
      return {
        success: false,
        error: MoneyAccountValidationError("Opening balance cannot be negative."),
      };
    }

    if (
      !isExistingAccount &&
      openingBalance > 0 &&
      !normalizedScopeAccountDisplayNameSnapshot
    ) {
      return {
        success: false,
        error: MoneyAccountValidationError("Account label is required."),
      };
    }

    const saveResult = await repository.saveMoneyAccount({
      remoteId: normalizedRemoteId,
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      scopeAccountRemoteId: normalizedScopeAccountRemoteId,
      scopeAccountDisplayNameSnapshot: normalizedScopeAccountDisplayNameSnapshot,
      name: normalizedName,
      type: payload.type,
      currentBalance: nextCurrentBalance,
      description: normalizeOptional(payload.description),
      currencyCode: normalizeOptional(payload.currencyCode),
      isPrimary: payload.isPrimary,
      isActive: payload.isActive,
    });

    if (!saveResult.success || isExistingAccount || openingBalance <= 0) {
      return saveResult;
    }

    const openingPostResult = await postMoneyMovementUseCase.execute({
      remoteId: createTransactionRemoteId(),
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      accountRemoteId: normalizedScopeAccountRemoteId,
      accountDisplayNameSnapshot:
        normalizedScopeAccountDisplayNameSnapshot as string,
      transactionType: TransactionType.Income,
      direction: TransactionDirection.In,
      title: `Opening balance - ${saveResult.value.name}`,
      amount: openingBalance,
      currencyCode: saveResult.value.currencyCode,
      categoryLabel: OPENING_BALANCE_CATEGORY,
      note: "Initial balance entered when this money account was created.",
      happenedAt: Date.now(),
      settlementMoneyAccountRemoteId: saveResult.value.remoteId,
      settlementMoneyAccountDisplayNameSnapshot: saveResult.value.name,
      sourceModule: TransactionSourceModule.MoneyAccounts,
      sourceRemoteId: saveResult.value.remoteId,
      sourceAction: OPENING_BALANCE_SOURCE_ACTION,
      idempotencyKey: `money-account:${saveResult.value.remoteId}:opening-balance`,
    });

    if (!openingPostResult.success) {
      return {
        success: false,
        error: MoneyAccountValidationError(openingPostResult.error.message),
      };
    }

    const refreshedResult = await repository.getMoneyAccountByRemoteId(
      saveResult.value.remoteId,
    );

    return refreshedResult.success
      ? refreshedResult
      : (saveResult as MoneyAccountResult);
  },
});
