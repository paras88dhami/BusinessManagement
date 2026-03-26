import { authUserDbConfig } from "@/feature/session/data/dataSource/db/authUserDbConfig";
import { createDatabase } from "@/shared/database/createDatabase";
import { appSchema } from "@nozbe/watermelondb";

const schema = appSchema({
  version: 10,
  tables: [...authUserDbConfig.tables],
});

export const database = createDatabase({
  schema,
  models: [...authUserDbConfig.models],
});

export default database;
