import { AccountsResult } from "../types/accountSelection.types";

export interface GetAccessibleAccountsByUserRemoteIdUseCase {
  execute(userRemoteId: string): Promise<AccountsResult>;
}

