import { MoneyAccountsResult } from "@/feature/accounts/types/moneyAccount.types";

export interface GetMoneyAccountsUseCase {
  execute(scopeAccountRemoteId: string): Promise<MoneyAccountsResult>;
}
