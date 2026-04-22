import { getDatabaseSetupError } from "@/shared/database/createDatabase";
import {
  DatabaseStartupFailureDescription,
  DatabaseStartupFailureSource,
} from "@/shared/database/databaseStartupFailure.types";

const DATABASE_INTEGRITY_FAILURE_PREFIX = "Database integrity check failed:";

const resolveErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error) {
    return error.message;
  }

  return null;
};

export const describeDatabaseStartupFailure = (
  error: unknown,
): DatabaseStartupFailureDescription => {
  const setupError = getDatabaseSetupError();

  if (setupError) {
    return {
      source: DatabaseStartupFailureSource.AdapterSetup,
      reasonCode: "DB_ADAPTER_SETUP_FAILED",
      safeMessage: "The app could not open local data storage.",
      technicalMessage: setupError.message,
    };
  }

  const errorMessage = resolveErrorMessage(error);

  if (
    errorMessage &&
    errorMessage.startsWith(DATABASE_INTEGRITY_FAILURE_PREFIX)
  ) {
    return {
      source: DatabaseStartupFailureSource.IntegrityCheck,
      reasonCode: "DB_INTEGRITY_CHECK_FAILED",
      safeMessage:
        "The app found a local data issue and could not continue safely.",
      technicalMessage: errorMessage,
    };
  }

  return {
    source: DatabaseStartupFailureSource.Unknown,
    reasonCode: "DB_STARTUP_FAILED",
    safeMessage: "The app could not initialize local data storage.",
    technicalMessage: errorMessage,
  };
};
