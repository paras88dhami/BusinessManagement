import { SettingsRepository } from "../data/repository/settings.repository";
import {
  SETTINGS_BIOMETRIC_COMING_SOON_MESSAGE,
  SETTINGS_BIOMETRIC_LOGIN_AVAILABLE,
} from "../constants/settings.constants";
import { SettingsValidationError } from "../types/settings.types";
import { UpdateBiometricLoginPreferenceUseCase } from "./updateBiometricLoginPreference.useCase";

export const createUpdateBiometricLoginPreferenceUseCase = (
  settingsRepository: SettingsRepository,
): UpdateBiometricLoginPreferenceUseCase => ({
  async execute(enabled: boolean) {
    if (enabled && !SETTINGS_BIOMETRIC_LOGIN_AVAILABLE) {
      return {
        success: false,
        error: SettingsValidationError(SETTINGS_BIOMETRIC_COMING_SOON_MESSAGE),
      };
    }

    return settingsRepository.updateBiometricLoginEnabled(enabled);
  },
});
