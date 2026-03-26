import { authCredentialDbConfig } from "@/feature/session/data/dataSource/db/authCredentialDbConfig";
import { authUserDbConfig } from "@/feature/session/data/dataSource/db/authUserDbConfig";
import { migrations } from "@/app/database/migration";
import { createDatabase } from "@/shared/database/createDatabase";
import { appSchema } from "@nozbe/watermelondb";

const schema = appSchema({
  version: 11,
  tables: [...authUserDbConfig.tables, ...authCredentialDbConfig.tables],
});

export const database = createDatabase({
  schema,
  models: [...authUserDbConfig.models, ...authCredentialDbConfig.models],
  migrations,
});

export default database;
