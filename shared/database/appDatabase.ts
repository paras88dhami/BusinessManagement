import { AppSettingsModel } from "@/feature/appSettings/data/dataSource/db/appSettings.model";
import { appSettingsDbConfig } from "@/feature/appSettings/data/dataSource/db/appSettingsDbConfig";
import { businessNotesDbConfig } from "@/feature/appSettings/notes/data/dataSource/db/businessNoteDbConfig";
import { accountDbConfig } from "@/feature/auth/accountSelection/data/dataSource/db/accountDbConfig";
import { moneyAccountDbConfig } from "@/feature/accounts/data/dataSource/db/moneyAccountDbConfig";
import { billingDbConfig } from "@/feature/billing/data/dataSource/db/billingDbConfig";
import { categoryDbConfig } from "@/feature/categories/data/dataSource/db/categoryDbConfig";
import { contactDbConfig } from "@/feature/contacts/data/dataSource/db/contactDbConfig";
import { emiDbConfig } from "@/feature/emiLoans/data/dataSource/db/emiDbConfig";
import { inventoryMovementDbConfig } from "@/feature/inventory/data/dataSource/db/inventoryMovementDbConfig";
import { ledgerDbConfig } from "@/feature/ledger/data/dataSource/db/ledgerDbConfig";
import { productDbConfig } from "@/feature/products/data/dataSource/db/productDbConfig";
import { businessProfileDbConfig } from "@/feature/profile/business/data/dataSource/db/businessProfileDbConfig";
import { authCredentialDbConfig } from "@/feature/session/data/dataSource/db/authCredentialDbConfig";
import { authUserDbConfig } from "@/feature/session/data/dataSource/db/authUserDbConfig";
import { userManagementDbConfig } from "@/feature/userManagement/data/dataSource/db/userManagementDbConfig";
import { transactionDbConfig } from "@/feature/transactions/data/dataSource/db/transactionDbConfig";
import {
    assertDatabaseSetupHealthy,
    createDatabase,
} from "@/shared/database/createDatabase";
import { migrations } from "@/shared/database/migration";
import { appSchema } from "@nozbe/watermelondb";

const APP_SETTINGS_TABLE = "app_settings";

const schema = appSchema({
  version: 24,
  tables: [
    ...authUserDbConfig.tables,
    ...authCredentialDbConfig.tables,
    ...accountDbConfig.tables,
    ...moneyAccountDbConfig.tables,
    ...contactDbConfig.tables,
    ...billingDbConfig.tables,
    ...businessProfileDbConfig.tables,
    ...businessNotesDbConfig.tables,
    ...appSettingsDbConfig.tables,
    ...userManagementDbConfig.tables,
    ...transactionDbConfig.tables,
    ...ledgerDbConfig.tables,
    ...emiDbConfig.tables,
    ...productDbConfig.tables,
    ...inventoryMovementDbConfig.tables,
    ...categoryDbConfig.tables,
  ],
});

export const database = createDatabase({
  schema,
  models: [
    ...authUserDbConfig.models,
    ...authCredentialDbConfig.models,
    ...accountDbConfig.models,
    ...moneyAccountDbConfig.models,
    ...contactDbConfig.models,
    ...billingDbConfig.models,
    ...businessProfileDbConfig.models,
    ...businessNotesDbConfig.models,
    ...appSettingsDbConfig.models,
    ...userManagementDbConfig.models,
    ...transactionDbConfig.models,
    ...ledgerDbConfig.models,
    ...emiDbConfig.models,
    ...productDbConfig.models,
    ...inventoryMovementDbConfig.models,
    ...categoryDbConfig.models,
  ],
  migrations,
});

export const ensureDatabaseReady = async (): Promise<void> => {
  assertDatabaseSetupHealthy();

  const appSettingsCollection =
    database.get<AppSettingsModel>(APP_SETTINGS_TABLE);

  await appSettingsCollection.query().fetchCount();
  assertDatabaseSetupHealthy();
};

export default database;
