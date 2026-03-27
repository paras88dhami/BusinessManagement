import { AppSettingsModel } from "../../../../setting/appSetting/data/dataSource/db/appSettings.model";
import { appSettingsTable } from "../../../../setting/appSetting/data/dataSource/db/appSettings.schema";

export const appSettingsDbConfig = {
  models: [AppSettingsModel],
  tables: [appSettingsTable],
};
