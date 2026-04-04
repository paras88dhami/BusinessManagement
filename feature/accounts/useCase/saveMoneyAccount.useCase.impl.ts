import {
  MONEY_ACCOUNT_TYPE_OPTIONS,
  MoneyAccountValidationError,
  SaveMoneyAccountPayload,
} from "@/feature/accounts/types/moneyAccount.types";
import { MoneyAccountRepository } from "@/feature/accounts/data/repository/moneyAccount.repository";
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

export const createSaveMoneyAccountUseCase = (
  repository: MoneyAccountRepository,
): SaveMoneyAccountUseCase => ({
  async execute(payload: SaveMoneyAccountPayload) {
    const normalizedRemoteId = normalizeRequired(payload.remoteId);
    const normalizedOwnerUserRemoteId = normalizeRequired(payload.ownerUserRemoteId);
    const normalizedScopeAccountRemoteId = normalizeRequired(
      payload.scopeAccountRemoteId,
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

    if (!Number.isFinite(payload.currentBalance)) {
      return {
        success: false,
        error: MoneyAccountValidationError("Balance is required."),
      };
    }

    if (payload.currentBalance < 0) {
      return {
        success: false,
        error: MoneyAccountValidationError("Balance cannot be negative."),
      };
    }

    return repository.saveMoneyAccount({
      remoteId: normalizedRemoteId,
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      scopeAccountRemoteId: normalizedScopeAccountRemoteId,
      name: normalizedName,
      type: payload.type,
      currentBalance: payload.currentBalance,
      description: normalizeOptional(payload.description),
      currencyCode: normalizeOptional(payload.currencyCode),
      isPrimary: payload.isPrimary,
      isActive: payload.isActive,
    });
  },
});
