import { Result } from "@/shared/types/result.types";
import {
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";

export type AppearanceSettingsRecord = {
  themePreference: AppearanceThemePreferenceValue;
  textSizePreference: AppearanceTextSizePreferenceValue;
  compactModeEnabled: boolean;
  updatedAt: number;
};

export interface AppearanceDatasource {
  getAppearancePreferences(): Promise<Result<AppearanceSettingsRecord>>;
  saveAppearancePreferences(params: {
    themePreference: AppearanceThemePreferenceValue;
    textSizePreference: AppearanceTextSizePreferenceValue;
    compactModeEnabled: boolean;
  }): Promise<Result<AppearanceSettingsRecord>>;
}
