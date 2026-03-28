import { AccountRepository } from "../data/repository/account.repository";
import {
  AccountType,
  AccountResult,
  AccountSelectionValidationError,
  SaveAccountPayload,
} from "../types/accountSelection.types";
import { SaveAccountUseCase } from "./saveAccount.useCase";

export const createSaveAccountUseCase = (
  accountRepository: AccountRepository,
): SaveAccountUseCase => ({
  async execute(payload: SaveAccountPayload): Promise<AccountResult> {
    if (!payload.remoteId.trim()) {
      return {
        success: false,
        error: AccountSelectionValidationError("Remote id is required."),
      };
    }

    if (!payload.ownerUserRemoteId.trim()) {
      return {
        success: false,
        error: AccountSelectionValidationError("Owner user remote id is required."),
      };
    }

    if (!payload.displayName.trim()) {
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

    return accountRepository.saveAccount(payload);
  },
});
