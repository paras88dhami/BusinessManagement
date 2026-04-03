import { UserManagementRepository } from "@/feature/userManagement/data/repository/userManagement.repository";
import { UserManagementErrorType } from "@/feature/userManagement/types/userManagement.types";
import { sortAccountsByDefaultAndUpdatedAt } from "@/shared/utils/account/accountSorting.util";
import { AccountRepository } from "../data/repository/account.repository";
import {
  AccountSelectionDatabaseError,
  AccountSelectionUnknownError,
  AccountSelectionValidationError,
  AccountsResult,
} from "../types/accountSelection.types";
import { GetAccessibleAccountsByUserRemoteIdUseCase } from "./getAccessibleAccountsByUserRemoteId.useCase";

type CreateGetAccessibleAccountsByUserRemoteIdUseCaseParams = {
  accountRepository: AccountRepository;
  userManagementRepository: UserManagementRepository;
};

const mapUserManagementErrorToAccountSelectionError = (
  error: { type: string; message: string },
) => {
  if (error.type === UserManagementErrorType.ValidationError) {
    return AccountSelectionValidationError(error.message);
  }

  if (error.type === UserManagementErrorType.DatabaseError) {
    return {
      ...AccountSelectionDatabaseError,
      message: error.message,
    };
  }

  return {
    ...AccountSelectionUnknownError,
    message: error.message,
  };
};

export const createGetAccessibleAccountsByUserRemoteIdUseCase = ({
  accountRepository,
  userManagementRepository,
}: CreateGetAccessibleAccountsByUserRemoteIdUseCaseParams): GetAccessibleAccountsByUserRemoteIdUseCase => ({
  async execute(userRemoteId: string): Promise<AccountsResult> {
    const normalizedUserRemoteId = userRemoteId.trim();

    if (!normalizedUserRemoteId) {
      return {
        success: false,
        error: AccountSelectionValidationError("User remote id is required."),
      };
    }

    const [ownerAccountsResult, memberAccountRemoteIdsResult] = await Promise.all([
      accountRepository.getAccountsByOwnerUserRemoteId(normalizedUserRemoteId),
      userManagementRepository.getActiveMemberAccountRemoteIdsByUserRemoteId(
        normalizedUserRemoteId,
      ),
    ]);

    if (!ownerAccountsResult.success) {
      return ownerAccountsResult;
    }

    if (!memberAccountRemoteIdsResult.success) {
      return {
        success: false,
        error: mapUserManagementErrorToAccountSelectionError(
          memberAccountRemoteIdsResult.error,
        ),
      };
    }

    const memberAccountRemoteIds = memberAccountRemoteIdsResult.value;

    if (memberAccountRemoteIds.length === 0) {
      return {
        success: true,
        value: sortAccountsByDefaultAndUpdatedAt(
          ownerAccountsResult.value.filter((account) => account.isActive),
        ),
      };
    }

    const memberAccountsResult = await accountRepository.getAccountsByRemoteIds(
      memberAccountRemoteIds,
    );

    if (!memberAccountsResult.success) {
      return memberAccountsResult;
    }

    const accountByRemoteId = new Map(
      ownerAccountsResult.value.map((account) => [account.remoteId, account]),
    );

    for (const memberAccount of memberAccountsResult.value) {
      accountByRemoteId.set(memberAccount.remoteId, memberAccount);
    }

    const activeAccounts = Array.from(accountByRemoteId.values()).filter(
      (account) => account.isActive,
    );

    return {
      success: true,
      value: sortAccountsByDefaultAndUpdatedAt(activeAccounts),
    };
  },
});

