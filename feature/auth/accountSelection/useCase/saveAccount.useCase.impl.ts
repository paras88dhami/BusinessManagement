import { AccountRepository } from "../data/repository/account.repository";
import {
  BUSINESS_TYPE_VALUES,
  BusinessTypeValue,
} from "@/shared/constants/businessType.constants";
import { TaxMode, TaxModeValue } from "@/shared/types/regionalFinance.types";
import {
  AccountType,
  Account,
  AccountResult,
  AccountSelectionValidationError,
  SaveAccountPayload,
} from "../types/accountSelection.types";
import { SaveAccountUseCase } from "./saveAccount.useCase";

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const normalizeDefaultTaxRatePercent = (
  value: number | null | undefined,
): {
  valid: true;
  value: number | null;
} | {
  valid: false;
  errorMessage: string;
} => {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }

  if (!Number.isFinite(value) || value < 0) {
    return {
      valid: false,
      errorMessage: "Default tax rate must be a non-negative number.",
    };
  }

  return { valid: true, value: Number(value) };
};

const normalizeDefaultTaxMode = (
  value: TaxModeValue | string | null | undefined,
): {
  valid: true;
  value: TaxModeValue | null;
} | {
  valid: false;
  errorMessage: string;
} => {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }

  if (value === TaxMode.Exclusive || value === TaxMode.Inclusive) {
    return { valid: true, value };
  }

  return {
    valid: false,
    errorMessage: "Default tax mode is invalid.",
  };
};

const normalizeBusinessType = (
  accountType: SaveAccountPayload["accountType"],
  businessType: SaveAccountPayload["businessType"],
): {
  valid: true;
  value: BusinessTypeValue | null;
} | {
  valid: false;
  errorMessage: string;
} => {
  if (accountType !== AccountType.Business) {
    return { valid: true, value: null };
  }

  if (businessType === null) {
    return {
      valid: false,
      errorMessage: "Business type is required for business accounts.",
    };
  }

  const normalizedBusinessType = businessType.trim();

  if (!normalizedBusinessType) {
    return {
      valid: false,
      errorMessage: "Business type is required for business accounts.",
    };
  }

  if (
    !BUSINESS_TYPE_VALUES.includes(
      normalizedBusinessType as (typeof BUSINESS_TYPE_VALUES)[number],
    )
  ) {
    return {
      valid: false,
      errorMessage: "Business type is invalid.",
    };
  }

  return { valid: true, value: normalizedBusinessType as BusinessTypeValue };
};

const mapAccountToSavePayload = (account: Account): SaveAccountPayload => ({
  remoteId: account.remoteId,
  ownerUserRemoteId: account.ownerUserRemoteId,
  accountType: account.accountType,
  businessType: account.businessType,
  displayName: account.displayName,
  currencyCode: account.currencyCode,
  cityOrLocation: account.cityOrLocation,
  countryCode: account.countryCode,
  defaultTaxRatePercent: account.defaultTaxRatePercent,
  defaultTaxMode: account.defaultTaxMode,
  isActive: account.isActive,
  isDefault: account.isDefault,
});

export const createSaveAccountUseCase = (
  accountRepository: AccountRepository,
): SaveAccountUseCase => ({
  async execute(payload: SaveAccountPayload): Promise<AccountResult> {
    const normalizedRemoteId = normalizeRequired(payload.remoteId);
    const normalizedOwnerUserRemoteId = normalizeRequired(payload.ownerUserRemoteId);
    const normalizedDisplayName = normalizeRequired(payload.displayName);

    if (!normalizedRemoteId) {
      return {
        success: false,
        error: AccountSelectionValidationError("Remote id is required."),
      };
    }

    if (!normalizedOwnerUserRemoteId) {
      return {
        success: false,
        error: AccountSelectionValidationError("Owner user remote id is required."),
      };
    }

    if (!normalizedDisplayName) {
      return {
        success: false,
        error: AccountSelectionValidationError("Display name is required."),
      };
    }

    if (
      payload.accountType !== AccountType.Personal &&
      payload.accountType !== AccountType.Business
    ) {
      return {
        success: false,
        error: AccountSelectionValidationError("Account type is invalid."),
      };
    }

    const normalizedBusinessTypeResult = normalizeBusinessType(
      payload.accountType,
      payload.businessType,
    );

    if (!normalizedBusinessTypeResult.valid) {
      return {
        success: false,
        error: AccountSelectionValidationError(
          normalizedBusinessTypeResult.errorMessage,
        ),
      };
    }

    const normalizedPayload: SaveAccountPayload = {
      remoteId: normalizedRemoteId,
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      accountType: payload.accountType,
      businessType: normalizedBusinessTypeResult.value,
      displayName: normalizedDisplayName,
      currencyCode: normalizeOptional(payload.currencyCode),
      cityOrLocation: normalizeOptional(payload.cityOrLocation),
      countryCode: normalizeOptional(payload.countryCode),
      defaultTaxRatePercent: null,
      defaultTaxMode: null,
      isActive: payload.isActive,
      isDefault: payload.isDefault,
    };

    const normalizedDefaultTaxRatePercentResult = normalizeDefaultTaxRatePercent(
      payload.defaultTaxRatePercent,
    );
    if (!normalizedDefaultTaxRatePercentResult.valid) {
      return {
        success: false,
        error: AccountSelectionValidationError(
          normalizedDefaultTaxRatePercentResult.errorMessage,
        ),
      };
    }

    const normalizedDefaultTaxModeResult = normalizeDefaultTaxMode(
      payload.defaultTaxMode,
    );
    if (!normalizedDefaultTaxModeResult.valid) {
      return {
        success: false,
        error: AccountSelectionValidationError(
          normalizedDefaultTaxModeResult.errorMessage,
        ),
      };
    }

    normalizedPayload.defaultTaxRatePercent =
      normalizedDefaultTaxRatePercentResult.value;
    normalizedPayload.defaultTaxMode = normalizedDefaultTaxModeResult.value;

    if (normalizedPayload.isDefault) {
      const existingAccountsResult =
        await accountRepository.getAccountsByOwnerUserRemoteId(
          normalizedPayload.ownerUserRemoteId,
        );

      if (!existingAccountsResult.success) {
        return existingAccountsResult;
      }

      const existingDefaultAccounts = existingAccountsResult.value.filter(
        (account) =>
          account.isDefault && account.remoteId !== normalizedPayload.remoteId,
      );

      for (const existingDefaultAccount of existingDefaultAccounts) {
        const clearDefaultResult = await accountRepository.saveAccount({
          ...mapAccountToSavePayload(existingDefaultAccount),
          isDefault: false,
        });

        if (!clearDefaultResult.success) {
          return clearDefaultResult;
        }
      }
    }

    return accountRepository.saveAccount(normalizedPayload);
  },
});
