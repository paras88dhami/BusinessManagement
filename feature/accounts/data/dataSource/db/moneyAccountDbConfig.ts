import { MoneyAccountModel } from "./moneyAccount.model";
import { moneyAccountsTable } from "./moneyAccount.schema";

export const moneyAccountDbConfig = {
  models: [MoneyAccountModel],
  tables: [moneyAccountsTable],
};
