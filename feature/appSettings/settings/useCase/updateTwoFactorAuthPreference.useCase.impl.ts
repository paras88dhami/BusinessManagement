import { SettingsRepository } from "../data/repository/settings.repository";
import {
  SETTINGS_TWO_FACTOR_AUTH_AVAILABLE,
  SETTINGS_TWO_FACTOR_COMING_SOON_MESSAGE,
} from "../constants/settings.constants";
import { SettingsValidationError } from "../types/settings.types";
import { UpdateTwoFactorAuthPreferenceUseCase } from "./updateTwoFactorAuthPreference.useCase";

export const createUpdateTwoFactorAuthPreferenceUseCase = (
  settingsRepository: SettingsRepository,
): UpdateTwoFactorAuthPreferenceUseCase => ({
  async execute(enabled: boolean) {
    if (enabled && !SETTINGS_TWO_FACTOR_AUTH_AVAILABLE) {
      return {
        success: false,
        error: SettingsValidationError(SETTINGS_TWO_FACTOR_COMING_SOON_MESSAGE),
      };
    }

    return settingsRepository.updateTwoFactorAuthEnabled(enabled);
  },
});
