import { useMemo } from "react";
import { Database } from "@nozbe/watermelondb";
import { bootstrapSelectedLanguage } from "@/shared/i18n/resources/bootstrapSelectedLanguage";
import { ensureDatabaseReady } from "@/shared/database/appDatabase";
import { ensureUserManagementReady } from "@/feature/setting/accounts/userManagement/factory/userManagementBootstrap.factory";
import { StartupBootstrapTask } from "@/feature/startup/types/startup.types";
import { createBootstrapStartupUseCase } from "@/feature/startup/useCase/bootstrapStartup.useCase.impl";
import { useStartupBootstrapViewModel } from "@/feature/startup/viewModel/startupBootstrap.viewModel.impl";

type UseStartupBootstrapFactoryParams = {
  database: Database;
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
      },
      {
        key: "user_management_seed",
        run: async () => {
          await ensureUserManagementReady(database);
        },
      },
      {
        key: "language_bootstrap",
        run: async () => {
          await bootstrapSelectedLanguage();
        },
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
