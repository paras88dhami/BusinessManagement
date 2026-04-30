import { SETTINGS_IMPORT_DISABLED_MESSAGE } from "../constants/settings.constants";
import { SettingsRepository } from "../data/repository/settings.repository";
import { SettingsValidationError } from "../types/settings.types";
import {
  ImportSettingsDataPayload,
  ImportSettingsDataUseCase,
} from "./importSettingsData.useCase";

export const createImportSettingsDataUseCase = (
  _settingsRepository: SettingsRepository,
): ImportSettingsDataUseCase => ({
  async execute(_payload: ImportSettingsDataPayload) {
    return {
      success: false,
      error: SettingsValidationError(SETTINGS_IMPORT_DISABLED_MESSAGE),
    };
  },
});
