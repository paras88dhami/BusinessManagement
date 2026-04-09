import {
  AppearancePreferencesResult,
  SaveAppearancePreferencesPayload,
} from "@/feature/appSettings/appearance/types/appearance.types";

export interface SaveAppearancePreferencesUseCase {
  execute(
    payload: SaveAppearancePreferencesPayload,
  ): Promise<AppearancePreferencesResult>;
}
