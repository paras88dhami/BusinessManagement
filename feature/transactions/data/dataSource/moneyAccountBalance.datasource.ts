import { MoneyAccountModel } from "@/feature/accounts/data/dataSource/db/moneyAccount.model";
import { Result } from "@/shared/types/result.types";

export interface MoneyAccountBalanceDatasource {
  getActiveMoneyAccountByRemoteId(
    remoteId: string,
  ): Promise<Result<MoneyAccountModel | null>>;

  applyMoneyAccountBalanceDelta(
    existing: MoneyAccountModel,
    delta: number,
  ): Promise<Result<MoneyAccountModel>>;
}
