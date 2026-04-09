import { AppearancePreferencesResult } from "@/feature/appSettings/appearance/types/appearance.types";

export interface GetAppearancePreferencesUseCase {
  execute(): Promise<AppearancePreferencesResult>;
}
