import { AccountModel } from "./account.model";
import { accountsTable } from "./account.schema";

export const accountDbConfig = {
  models: [AccountModel],
  tables: [accountsTable],
};
