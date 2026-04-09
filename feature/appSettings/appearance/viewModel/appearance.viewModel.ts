import {
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";

export interface AppearanceSettingsViewModel {
  isLoading: boolean;
  isSaving: boolean;
  isAppearanceVisible: boolean;
  errorMessage: string | null;
  appearanceSummaryLabel: string;
  selectedThemePreference: AppearanceThemePreferenceValue;
  selectedTextSizePreference: AppearanceTextSizePreferenceValue;
  compactModeEnabled: boolean;
  settingsSectionTitle: string;
  appearanceTitle: string;
  appearanceSubtitle: string;
  appearanceModalTitle: string;
  appearanceModalSubtitle: string;
  compactModeTitle: string;
  compactModeSubtitle: string;
  onRefresh: () => Promise<void>;
  onOpenAppearance: () => void;
  onCloseAppearance: () => void;
  onSelectThemePreference: (
    value: AppearanceThemePreferenceValue,
  ) => Promise<void>;
  onSelectTextSizePreference: (
    value: AppearanceTextSizePreferenceValue,
  ) => Promise<void>;
  onToggleCompactMode: (value: boolean) => Promise<void>;
}
