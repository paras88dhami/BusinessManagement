import { AppearanceRepository } from "@/feature/appSettings/appearance/data/repository/appearance.repository";
import { GetAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/getAppearancePreferences.useCase";

export const createGetAppearancePreferencesUseCase = (
  repository: AppearanceRepository,
): GetAppearancePreferencesUseCase => ({
  execute() {
    return repository.getAppearancePreferences();
  },
});
