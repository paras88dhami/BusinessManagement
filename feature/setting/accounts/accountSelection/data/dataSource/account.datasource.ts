import { Result } from "@/shared/types/result.types";
import { SaveAccountPayload } from "../../types/accountSelection.types";
import { AccountModel } from "./db/account.model";

export interface AccountDatasource {
  saveAccount(payload: SaveAccountPayload): Promise<Result<AccountModel>>;
  getAccountsByOwnerUserRemoteId(
    ownerUserRemoteId: string,
  ): Promise<Result<AccountModel[]>>;
}
