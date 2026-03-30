import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

type CreateDatabaseParams = {
  schema: any;
  models: any[];
  migrations?: any;
};

let databaseSetupError: Error | null = null;

const normalizeSetupError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Database setup failed with an unknown error.");
};

export const getDatabaseSetupError = (): Error | null => {
  return databaseSetupError;
};

export const assertDatabaseSetupHealthy = (): void => {
  if (databaseSetupError) {
    throw databaseSetupError;
  }
};

export function createDatabase({
  schema,
  models,
  migrations,
}: CreateDatabaseParams) {
  databaseSetupError = null;

  const adapter = new SQLiteAdapter({
    schema,
    migrations,
    jsi: true,
    onSetUpError: (error) => {
      const setupError = normalizeSetupError(error);
      databaseSetupError = setupError;
      console.error("Database setup failed.", setupError);
    },
  });

  return new Database({
    adapter,
    modelClasses: models,
  });
}
