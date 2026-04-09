import React from "react";
import { Database } from "@nozbe/watermelondb";
import { createLocalAppearanceDatasource } from "@/feature/appSettings/appearance/data/dataSource/local.appearance.datasource.impl";
import { createAppearanceRepository } from "@/feature/appSettings/appearance/data/repository/appearance.repository.impl";
import { AppearanceSettingsScreen } from "@/feature/appSettings/appearance/ui/AppearanceSettingsScreen";
import { createGetAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/getAppearancePreferences.useCase.impl";
import { createSaveAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/saveAppearancePreferences.useCase.impl";
import { useAppearanceSettingsViewModel } from "@/feature/appSettings/appearance/viewModel/appearance.viewModel.impl";

type GetAppearanceSettingsScreenFactoryProps = {
  database: Database;
};

export function GetAppearanceSettingsScreenFactory({
  database,
}: GetAppearanceSettingsScreenFactoryProps) {
  const datasource = React.useMemo(
    () => createLocalAppearanceDatasource(database),
    [database],
  );
  const repository = React.useMemo(
    () => createAppearanceRepository(datasource),
    [datasource],
  );
  const getAppearancePreferencesUseCase = React.useMemo(
    () => createGetAppearancePreferencesUseCase(repository),
    [repository],
  );
  const saveAppearancePreferencesUseCase = React.useMemo(
    () => createSaveAppearancePreferencesUseCase(repository),
    [repository],
  );

  const viewModel = useAppearanceSettingsViewModel({
    getAppearancePreferencesUseCase,
    saveAppearancePreferencesUseCase,
  });

  return <AppearanceSettingsScreen viewModel={viewModel} />;
}
