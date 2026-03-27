import {
  AccountResult,
  AccountsResult,
  SaveAccountPayload,
} from "../../types/accountSelection.types";

export interface AccountRepository {
  saveAccount(payload: SaveAccountPayload): Promise<AccountResult>;
  getAccountsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<AccountsResult>;
}
