import {
  AppearancePreferencesResult,
  SaveAppearancePreferencesPayload,
} from "@/feature/appSettings/appearance/types/appearance.types";

export interface AppearanceRepository {
  getAppearancePreferences(): Promise<AppearancePreferencesResult>;
  saveAppearancePreferences(
    payload: SaveAppearancePreferencesPayload,
  ): Promise<AppearancePreferencesResult>;
}
