import { Result } from "@/shared/types/result.types";
import { SaveAccountPayload } from "../../types/accountSelection.types";
import { AccountModel } from "./db/account.model";

export interface AccountDatasource {
  saveAccount(payload: SaveAccountPayload): Promise<Result<AccountModel>>;
  getAccountByRemoteId(
    remoteId: string,
  ): Promise<Result<AccountModel | null>>;
  getAccountsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<Result<AccountModel[]>>;
  getAccountsByRemoteIds(
    remoteIds: readonly string[],
  ): Promise<Result<AccountModel[]>>;
}
