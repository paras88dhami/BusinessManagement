import { createLocalAppearanceDatasource } from "@/feature/appSettings/appearance/data/dataSource/local.appearance.datasource.impl";
import { createAppearanceRepository } from "@/feature/appSettings/appearance/data/repository/appearance.repository.impl";
import { createGetAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/getAppearancePreferences.useCase.impl";
import { createSaveAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/saveAppearancePreferences.useCase.impl";
import { createLocalSettingsDatasource } from "@/feature/appSettings/settings/data/dataSource/local.settings.datasource.impl";
import { createSettingsRepository } from "@/feature/appSettings/settings/data/repository/settings.repository.impl";
import { SettingsScreen } from "@/feature/appSettings/settings/ui/SettingsScreen";
import { createChangePasswordUseCase } from "@/feature/appSettings/settings/useCase/changePassword.useCase.impl";
import { createGetSettingsBootstrapUseCase } from "@/feature/appSettings/settings/useCase/getSettingsBootstrap.useCase.impl";
import { createSubmitAppRatingUseCase } from "@/feature/appSettings/settings/useCase/submitAppRating.useCase.impl";
import { createSubmitBugReportUseCase } from "@/feature/appSettings/settings/useCase/submitBugReport.useCase.impl";
import { createUpdateBiometricLoginPreferenceUseCase } from "@/feature/appSettings/settings/useCase/updateBiometricLoginPreference.useCase.impl";
import { createUpdateTwoFactorAuthPreferenceUseCase } from "@/feature/appSettings/settings/useCase/updateTwoFactorAuthPreference.useCase.impl";
import { useSettingsViewModel } from "@/feature/appSettings/settings/viewModel/settings.viewModel.impl";
import { createLocalAuthCredentialDatasource } from "@/feature/session/data/dataSource/local.authCredential.datasource.impl";
import { createAuthCredentialRepository } from "@/feature/session/data/repository/authCredential.repository.impl";
import { createPasswordHashService } from "@/shared/utils/auth/passwordHash.service";
import appDatabase from "@/shared/database/appDatabase";
import React from "react";

type GetSettingsScreenFactoryProps = {
  activeUserRemoteId: string | null;
  onBack: () => void;
};

export function GetSettingsScreenFactory({
  activeUserRemoteId,
  onBack,
}: GetSettingsScreenFactoryProps) {
  const appearanceDatasource = React.useMemo(
    () => createLocalAppearanceDatasource(appDatabase),
    [],
  );
  const appearanceRepository = React.useMemo(
    () => createAppearanceRepository(appearanceDatasource),
    [appearanceDatasource],
  );
  const getAppearancePreferencesUseCase = React.useMemo(
    () => createGetAppearancePreferencesUseCase(appearanceRepository),
    [appearanceRepository],
  );
  const saveAppearancePreferencesUseCase = React.useMemo(
    () => createSaveAppearancePreferencesUseCase(appearanceRepository),
    [appearanceRepository],
  );

  const settingsDatasource = React.useMemo(
    () => createLocalSettingsDatasource(appDatabase),
    [],
  );
  const settingsRepository = React.useMemo(
    () => createSettingsRepository(settingsDatasource),
    [settingsDatasource],
  );

  const authCredentialDatasource = React.useMemo(
    () => createLocalAuthCredentialDatasource(appDatabase),
    [],
  );
  const authCredentialRepository = React.useMemo(
    () => createAuthCredentialRepository(authCredentialDatasource),
    [authCredentialDatasource],
  );
  const passwordHashService = React.useMemo(() => createPasswordHashService(), []);

  const getSettingsBootstrapUseCase = React.useMemo(
    () =>
      createGetSettingsBootstrapUseCase(
        settingsRepository,
        authCredentialRepository,
      ),
    [authCredentialRepository, settingsRepository],
  );
  const updateBiometricLoginPreferenceUseCase = React.useMemo(
    () => createUpdateBiometricLoginPreferenceUseCase(settingsRepository),
    [settingsRepository],
  );
  const updateTwoFactorAuthPreferenceUseCase = React.useMemo(
    () => createUpdateTwoFactorAuthPreferenceUseCase(settingsRepository),
    [settingsRepository],
  );
  const submitBugReportUseCase = React.useMemo(
    () => createSubmitBugReportUseCase(settingsRepository),
    [settingsRepository],
  );
  const submitAppRatingUseCase = React.useMemo(
    () => createSubmitAppRatingUseCase(settingsRepository),
    [settingsRepository],
  );
  const changePasswordUseCase = React.useMemo(
    () =>
      createChangePasswordUseCase(
        authCredentialRepository,
        passwordHashService,
      ),
    [authCredentialRepository, passwordHashService],
  );

  const viewModel = useSettingsViewModel({
    activeUserRemoteId,
    getAppearancePreferencesUseCase,
    saveAppearancePreferencesUseCase,
    getSettingsBootstrapUseCase,
    updateBiometricLoginPreferenceUseCase,
    updateTwoFactorAuthPreferenceUseCase,
    submitBugReportUseCase,
    submitAppRatingUseCase,
    changePasswordUseCase,
  });

  return <SettingsScreen viewModel={viewModel} onBack={onBack} />;
}
