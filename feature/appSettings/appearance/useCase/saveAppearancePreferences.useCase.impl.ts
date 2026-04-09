import { AppearanceRepository } from "@/feature/appSettings/appearance/data/repository/appearance.repository";
import {
  AppearanceTextSizePreference,
  AppearanceThemePreference,
  AppearanceValidationError,
  SaveAppearancePreferencesPayload,
} from "@/feature/appSettings/appearance/types/appearance.types";
import { SaveAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/saveAppearancePreferences.useCase";

const allowedThemePreferences = new Set<string>([
  AppearanceThemePreference.Light,
  AppearanceThemePreference.Dark,
  AppearanceThemePreference.System,
]);

const allowedTextSizePreferences = new Set<string>([
  AppearanceTextSizePreference.Small,
  AppearanceTextSizePreference.Medium,
  AppearanceTextSizePreference.Large,
]);

export const createSaveAppearancePreferencesUseCase = (
  repository: AppearanceRepository,
): SaveAppearancePreferencesUseCase => ({
  async execute(payload: SaveAppearancePreferencesPayload) {
    if (!allowedThemePreferences.has(payload.themePreference)) {
      return {
        success: false,
        error: AppearanceValidationError("Select a valid theme option."),
      };
    }

    if (!allowedTextSizePreferences.has(payload.textSizePreference)) {
      return {
        success: false,
        error: AppearanceValidationError("Select a valid text size option."),
      };
    }

    return repository.saveAppearancePreferences(payload);
  },
});
