import {
  AccountResult,
  AccountsResult,
  SaveAccountPayload,
} from "../../types/accountSelection.types";

export interface AccountRepository {
  saveAccount(payload: SaveAccountPayload): Promise<AccountResult>;
  getAccountByRemoteId(remoteId: string): Promise<AccountResult>;
  getAccountsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<AccountsResult>;
  getAccountsByRemoteIds(remoteIds: readonly string[]): Promise<AccountsResult>;
}
