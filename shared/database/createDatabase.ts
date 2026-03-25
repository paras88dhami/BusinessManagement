import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

type CreateDatabaseParams = {
  schema: any;
  models: any[];
  migrations?: any;
};

export function createDatabase({ schema, models, migrations }: CreateDatabaseParams) {
  const adapter = new SQLiteAdapter({
    schema,
    migrations,
    jsi: true,
    onSetUpError: (error) => {
      console.error(error);
    },
  });

  return new Database({
    adapter,
    modelClasses: models,
  });
}
