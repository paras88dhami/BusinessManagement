import { AccountsResult } from "../types/accountSelection.types";

export interface GetAccountsByOwnerUserRemoteIdUseCase {
  execute(ownerUserRemoteId: string): Promise<AccountsResult>;
}
