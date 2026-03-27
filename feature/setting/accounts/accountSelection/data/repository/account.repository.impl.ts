import {
  AccountNotFoundError,
  AccountResult,
  AccountSelectionDatabaseError,
  AccountSelectionError,
  AccountSelectionUnknownError,
  AccountsResult,
  SaveAccountPayload,
} from "../../types/accountSelection.types";
import { AccountDatasource } from "../dataSource/account.datasource";
import { AccountRepository } from "./account.repository";
import { mapAccountModelToDomain } from "./mapper/account.mapper";

export const createAccountRepository = (
  localDatasource: AccountDatasource,
): AccountRepository => ({
  async saveAccount(payload: SaveAccountPayload): Promise<AccountResult> {
    const result = await localDatasource.saveAccount(payload);

    if (result.success) {
      return mapAccountModel(result.value);
    }

    return {
      success: false,
      error: mapAccountError(result.error),
    };
  },

  async getAccountsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<AccountsResult> {
    const result = await localDatasource.getAccountsByOwnerUserRemoteId(
      ownerUserRemoteId,
    );

    if (result.success) {
      try {
        const mappedAccounts = await Promise.all(
          result.value.map((accountModel) => mapAccountModelToDomain(accountModel)),
        );

        return {
          success: true,
          value: mappedAccounts,
        };
      } catch (error) {
        return {
          success: false,
          error: mapAccountError(error),
        };
      }
    }

    return {
      success: false,
      error: mapAccountError(result.error),
    };
  },
});

const mapAccountModel = async (
  model: Parameters<typeof mapAccountModelToDomain>[0],
): Promise<AccountResult> => {
  try {
    return {
      success: true,
      value: await mapAccountModelToDomain(model),
    };
  } catch (error) {
    return {
      success: false,
      error: mapAccountError(error),
    };
  }
};

const mapAccountError = (error: Error | unknown): AccountSelectionError => {
  if (!(error instanceof Error)) {
    return AccountSelectionUnknownError;
  }

  const message = error.message.toLowerCase();

  if (message.includes("account not found")) {
    return AccountNotFoundError;
  }

  const isDatabaseError =
    message.includes("table") ||
    message.includes("schema") ||
    message.includes("database") ||
    message.includes("adapter") ||
    message.includes("timeout");

  if (isDatabaseError) {
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
