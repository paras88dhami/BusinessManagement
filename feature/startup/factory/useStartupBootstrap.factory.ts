import { useMemo } from "react";
import { Database } from "@nozbe/watermelondb";
import { bootstrapSelectedLanguage } from "@/shared/i18n/resources/bootstrapSelectedLanguage";
import { describeDatabaseStartupFailure } from "@/shared/database/describeDatabaseStartupFailure";
import { ensureDatabaseReady } from "@/shared/database/appDatabase";
import { ensureUserManagementReady } from "@/feature/userManagement/factory/userManagementBootstrap.factory";
import {
  StartupBootstrapTask,
  StartupBootstrapTaskFailureDescriptor,
  StartupFailureKind,
} from "@/feature/startup/types/startup.types";
import { createBootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase.impl";
import { useStartupBootstrapViewModel } from "@/feature/startup/viewModel/startupBootstrap.viewModel.impl";

type UseStartupBootstrapFactoryParams = {
  database: Database;
};

const resolveTechnicalMessage = (error: unknown): string | null => {
  if (error instanceof Error) {
    return error.message;
  }

  return null;
};

const createGenericTaskFailureDescriptor = (
  reasonCode: string,
  safeMessage: string,
) => {
  return (error: unknown): StartupBootstrapTaskFailureDescriptor => ({
    kind: StartupFailureKind.BootstrapTask,
    reasonCode,
    safeMessage,
    technicalMessage: resolveTechnicalMessage(error),
  });
};

export const useStartupBootstrapFactory = ({
  database,
}: UseStartupBootstrapFactoryParams) => {
  const tasks = useMemo<readonly StartupBootstrapTask[]>(
    () => [
      {
        key: "database_ready",
        run: async () => {
          await ensureDatabaseReady();
        },
        describeFailure: (error) => {
          const databaseFailure = describeDatabaseStartupFailure(error);

          return {
            kind: StartupFailureKind.Database,
            reasonCode: databaseFailure.reasonCode,
            safeMessage: databaseFailure.safeMessage,
            technicalMessage: databaseFailure.technicalMessage,
          };
        },
      },
      {
        key: "user_management_seed",
        run: async () => {
          await ensureUserManagementReady(database);
        },
        describeFailure: createGenericTaskFailureDescriptor(
          "USER_MANAGEMENT_BOOTSTRAP_FAILED",
          "The app could not initialize access data.",
        ),
      },
      {
        key: "language_bootstrap",
        run: async () => {
          await bootstrapSelectedLanguage();
        },
        describeFailure: createGenericTaskFailureDescriptor(
          "LANGUAGE_BOOTSTRAP_FAILED",
          "The app could not initialize language resources.",
        ),
      },
    ],
    [database],
  );

  const bootstrapStartupUseCase = useMemo(
    () => createBootstrapStartupUseCase(tasks),
    [tasks],
  );

  return useStartupBootstrapViewModel({
    bootstrapStartupUseCase,
  });
};
