import { AccountRepository } from "../data/repository/account.repository";
import {
  AccountSelectionValidationError,
  AccountsResult,
} from "../types/accountSelection.types";
import { GetAccountsByOwnerUserRemoteIdUseCase } from "./getAccountsByOwnerUserRemoteId.useCase";

export const createGetAccountsByOwnerUserRemoteIdUseCase = (
  accountRepository: AccountRepository,
): GetAccountsByOwnerUserRemoteIdUseCase => ({
  async execute(ownerUserRemoteId: string): Promise<AccountsResult> {
    if (!ownerUserRemoteId.trim()) {
      return {
        success: false,
        error: AccountSelectionValidationError("Owner user remote id is required."),
      };
    }

    return accountRepository.getAccountsByOwnerUserRemoteId(ownerUserRemoteId);
  },
});
