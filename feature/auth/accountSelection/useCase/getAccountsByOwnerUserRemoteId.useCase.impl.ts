import { AccountRepository } from "../data/repository/account.repository";
import {
  AccountSelectionValidationError,
  AccountsResult,
} from "../types/accountSelection.types";
import { sortAccountsByDefaultAndUpdatedAt } from "@/shared/utils/account/accountSorting.util";
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

    const accountsResult = await accountRepository.getAccountsByOwnerUserRemoteId(
      ownerUserRemoteId.trim(),
    );

    if (!accountsResult.success) {
      return accountsResult;
    }

    const activeAccounts = accountsResult.value.filter((account) => account.isActive);

    return {
      success: true,
      value: sortAccountsByDefaultAndUpdatedAt(activeAccounts),
    };
  },
});
