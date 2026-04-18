import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
import {
  MONEY_ACCOUNT_TYPE_OPTIONS,
  MoneyAccountErrorType,
  MoneyAccountValidationError,
  SaveMoneyAccountPayload,
} from "@/feature/accounts/types/moneyAccount.types";
import { RunMoneyAccountOpeningBalanceWorkflowUseCase } from "@/feature/accounts/workflow/moneyAccountOpeningBalance/useCase/runMoneyAccountOpeningBalance.useCase";
import { SaveMoneyAccountUseCase } from "./saveMoneyAccount.useCase";

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

type CreateSaveMoneyAccountUseCaseParams = {
  repository: MoneyAccountRepository;
  runMoneyAccountOpeningBalanceWorkflowUseCase: RunMoneyAccountOpeningBalanceWorkflowUseCase;
};

export const createSaveMoneyAccountUseCase = ({
  repository,
  runMoneyAccountOpeningBalanceWorkflowUseCase,
}: CreateSaveMoneyAccountUseCaseParams): SaveMoneyAccountUseCase => ({
  async execute(payload: SaveMoneyAccountPayload) {
    const normalizedRemoteId = normalizeRequired(payload.remoteId);
    const normalizedOwnerUserRemoteId = normalizeRequired(
      payload.ownerUserRemoteId,
    );
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

    const openingBalance = payload.currentBalance;

    if (!Number.isFinite(openingBalance)) {
      return {
        success: false,
        error: MoneyAccountValidationError("Opening balance is required."),
      };
    }

    if (openingBalance < 0) {
      return {
        success: false,
        error: MoneyAccountValidationError(
          "Opening balance cannot be negative.",
        ),
      };
    }

    const existingResult =
      await repository.getMoneyAccountByRemoteId(normalizedRemoteId);
    const existingAccount = existingResult.success
      ? existingResult.value
      : null;

    if (
      !existingResult.success &&
      existingResult.error.type !== MoneyAccountErrorType.MoneyAccountNotFound
    ) {
      return existingResult;
    }

    if (!existingAccount) {
      return runMoneyAccountOpeningBalanceWorkflowUseCase.execute({
        remoteId: normalizedRemoteId,
        ownerUserRemoteId: normalizedOwnerUserRemoteId,
        scopeAccountRemoteId: normalizedScopeAccountRemoteId,
        scopeAccountDisplayNameSnapshot:
          normalizedScopeAccountDisplayNameSnapshot,
        name: normalizedName,
        type: payload.type,
        currentBalance: openingBalance,
        description: normalizeOptional(payload.description),
        currencyCode: normalizeOptional(payload.currencyCode),
        isPrimary: payload.isPrimary,
        isActive: payload.isActive,
      });
    }

    return repository.saveMoneyAccount({
      remoteId: normalizedRemoteId,
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      scopeAccountRemoteId: normalizedScopeAccountRemoteId,
      scopeAccountDisplayNameSnapshot:
        normalizedScopeAccountDisplayNameSnapshot,
      name: normalizedName,
      type: payload.type,
      currentBalance: existingAccount.currentBalance,
      description: normalizeOptional(payload.description),
      currencyCode: normalizeOptional(payload.currencyCode),
      isPrimary: payload.isPrimary,
      isActive: payload.isActive,
    });
  },
});
