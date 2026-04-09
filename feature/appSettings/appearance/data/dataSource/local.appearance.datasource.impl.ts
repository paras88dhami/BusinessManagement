import { Database } from "@nozbe/watermelondb";
import {
  getAppearanceSettingsState,
  setAppearanceSettingsState,
} from "@/feature/appSettings/data/appSettings.store";
import {
  AppearanceTextSizePreference,
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreference,
  AppearanceThemePreferenceValue,
  isAppearanceTextSizePreferenceValue,
  isAppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";
import {
  AppearanceDatasource,
  AppearanceSettingsRecord,
} from "./appearance.datasource";
import { Result } from "@/shared/types/result.types";

const normalizeThemePreference = (
  value: string,
): AppearanceThemePreferenceValue => {
  if (isAppearanceThemePreferenceValue(value)) {
    return value;
  }

  return AppearanceThemePreference.Light;
};

const normalizeTextSizePreference = (
  value: string,
): AppearanceTextSizePreferenceValue => {
  if (isAppearanceTextSizePreferenceValue(value)) {
    return value;
  }

  return AppearanceTextSizePreference.Medium;
};

const mapRecord = (params: {
  themePreference: string;
  textSizePreference: string;
  compactModeEnabled: boolean;
  updatedAt: number;
}): AppearanceSettingsRecord => ({
  themePreference: normalizeThemePreference(params.themePreference),
  textSizePreference: normalizeTextSizePreference(params.textSizePreference),
  compactModeEnabled: params.compactModeEnabled === true,
  updatedAt: params.updatedAt,
});

export const createLocalAppearanceDatasource = (
  database: Database,
): AppearanceDatasource => ({
  async getAppearancePreferences(): Promise<Result<AppearanceSettingsRecord>> {
    try {
      const appearanceState = await getAppearanceSettingsState(database);

      return {
        success: true,
        value: mapRecord(appearanceState),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async saveAppearancePreferences({
    themePreference,
    textSizePreference,
    compactModeEnabled,
  }: {
    themePreference: AppearanceThemePreferenceValue;
    textSizePreference: AppearanceTextSizePreferenceValue;
    compactModeEnabled: boolean;
  }): Promise<Result<AppearanceSettingsRecord>> {
    try {
      const appearanceState = await setAppearanceSettingsState(database, {
        themePreference,
        textSizePreference,
        compactModeEnabled,
      });

      return {
        success: true,
        value: mapRecord(appearanceState),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
