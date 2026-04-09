import { AccountResult } from "../types/accountSelection.types";

export interface GetAccountByRemoteIdUseCase {
  execute(remoteId: string): Promise<AccountResult>;
}
