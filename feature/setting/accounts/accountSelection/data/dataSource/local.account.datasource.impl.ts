import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import {
  AccountSyncStatus,
  SaveAccountPayload,
} from "../../types/accountSelection.types";
import { AccountDatasource } from "./account.datasource";
import { AccountModel } from "./db/account.model";

const ACCOUNTS_TABLE = "accounts";

const setCreatedAndUpdatedAt = (record: AccountModel, now: number) => {
  (record as unknown as { _raw: Record<string, number> })._raw.created_at = now;
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const setUpdatedAt = (record: AccountModel, now: number) => {
  (record as unknown as { _raw: Record<string, number> })._raw.updated_at = now;
};

const updateSyncStatusOnMutation = (record: AccountModel) => {
  if (!record.recordSyncStatus) {
    record.recordSyncStatus = AccountSyncStatus.PendingUpdate;
    return;
  }

  if (record.recordSyncStatus === AccountSyncStatus.Synced) {
    record.recordSyncStatus = AccountSyncStatus.PendingUpdate;
  }
};

export const createLocalAccountDatasource = (
  database: Database,
): AccountDatasource => ({
  async saveAccount(payload: SaveAccountPayload): Promise<Result<AccountModel>> {
    try {
      const accountsCollection = database.get<AccountModel>(ACCOUNTS_TABLE);
      const existingAccounts = await accountsCollection
        .query(Q.where("remote_id", payload.remoteId))
        .fetch();

      const existingAccount = existingAccounts[0];

      if (existingAccount) {
        await database.write(async () => {
          await existingAccount.update((record) => {
            record.remoteId = payload.remoteId;
            record.ownerUserRemoteId = payload.ownerUserRemoteId;
            record.accountType = payload.accountType;
            record.businessType = payload.businessType;
            record.displayName = payload.displayName;
            record.currencyCode = payload.currencyCode;
            record.cityOrLocation = payload.cityOrLocation;
            record.countryCode = payload.countryCode;
            record.isActive = payload.isActive;
            record.isDefault = payload.isDefault;
            updateSyncStatusOnMutation(record);
            setUpdatedAt(record, Date.now());
          });
        });

        return { success: true, value: existingAccount };
      }

      let createdAccount!: AccountModel;

      await database.write(async () => {
        createdAccount = await accountsCollection.create((record) => {
          const now = Date.now();

          record.remoteId = payload.remoteId;
          record.ownerUserRemoteId = payload.ownerUserRemoteId;
          record.accountType = payload.accountType;
          record.businessType = payload.businessType;
          record.displayName = payload.displayName;
          record.currencyCode = payload.currencyCode;
          record.cityOrLocation = payload.cityOrLocation;
          record.countryCode = payload.countryCode;
          record.isActive = payload.isActive;
          record.isDefault = payload.isDefault;

          record.recordSyncStatus = AccountSyncStatus.PendingCreate;
          record.lastSyncedAt = null;
          record.deletedAt = null;

          setCreatedAndUpdatedAt(record, now);
        });
      });

      return { success: true, value: createdAccount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getAccountsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<Result<AccountModel[]>> {
    try {
      const accountsCollection = database.get<AccountModel>(ACCOUNTS_TABLE);
      const matchingAccounts = await accountsCollection
        .query(Q.where("owner_user_remote_id", ownerUserRemoteId))
        .fetch();

      return {
        success: true,
        value: matchingAccounts,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
