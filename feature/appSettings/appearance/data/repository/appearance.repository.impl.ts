import { AppearanceDatasource } from "@/feature/appSettings/appearance/data/dataSource/appearance.datasource";
import { AppearanceRepository } from "@/feature/appSettings/appearance/data/repository/appearance.repository";
import {
  AppearanceDatasourceError,
  AppearancePreferencesResult,
  AppearanceUnknownError,
  SaveAppearancePreferencesPayload,
} from "@/feature/appSettings/appearance/types/appearance.types";

export const createAppearanceRepository = (
  datasource: AppearanceDatasource,
): AppearanceRepository => ({
  async getAppearancePreferences(): Promise<AppearancePreferencesResult> {
    const result = await datasource.getAppearancePreferences();

    if (!result.success) {
      return {
        success: false,
        error: AppearanceDatasourceError,
      };
    }

    try {
      return {
        success: true,
        value: result.value,
      };
    } catch {
      return {
        success: false,
        error: AppearanceUnknownError,
      };
    }
  },

  async saveAppearancePreferences(
    payload: SaveAppearancePreferencesPayload,
  ): Promise<AppearancePreferencesResult> {
    const result = await datasource.saveAppearancePreferences(payload);

    if (!result.success) {
      return {
        success: false,
        error: AppearanceDatasourceError,
      };
    }

    try {
      return {
        success: true,
        value: result.value,
      };
    } catch {
      return {
        success: false,
        error: AppearanceUnknownError,
      };
    }
  },
});
