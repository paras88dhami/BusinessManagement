import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppearancePreferences,
  AppearanceTextSizePreference,
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreference,
  AppearanceThemePreferenceValue,
  SaveAppearancePreferencesPayload,
} from "@/feature/appSettings/appearance/types/appearance.types";
import { GetAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/getAppearancePreferences.useCase";
import { SaveAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/saveAppearancePreferences.useCase";
import { AppearanceSettingsViewModel } from "./appearance.viewModel";

type Params = {
  getAppearancePreferencesUseCase: GetAppearancePreferencesUseCase;
  saveAppearancePreferencesUseCase: SaveAppearancePreferencesUseCase;
};

const defaultAppearancePreferences: AppearancePreferences = {
  themePreference: AppearanceThemePreference.Light,
  textSizePreference: AppearanceTextSizePreference.Medium,
  compactModeEnabled: false,
  updatedAt: 0,
};

const themeLabelMap: Record<AppearanceThemePreferenceValue, string> = {
  [AppearanceThemePreference.Light]: "Light",
  [AppearanceThemePreference.Dark]: "Dark",
  [AppearanceThemePreference.System]: "System",
};

const textSizeLabelMap: Record<AppearanceTextSizePreferenceValue, string> = {
  [AppearanceTextSizePreference.Small]: "Small",
  [AppearanceTextSizePreference.Medium]: "Medium",
  [AppearanceTextSizePreference.Large]: "Large",
};

const buildAppearanceSummaryLabel = (
  appearancePreferences: AppearancePreferences,
): string => {
  const compactModeLabel = appearancePreferences.compactModeEnabled
    ? "Compact On"
    : "Compact Off";

  return `${themeLabelMap[appearancePreferences.themePreference]} | ${
    textSizeLabelMap[appearancePreferences.textSizePreference]
  } | ${compactModeLabel}`;
};

export const useAppearanceSettingsViewModel = ({
  getAppearancePreferencesUseCase,
  saveAppearancePreferencesUseCase,
}: Params): AppearanceSettingsViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAppearanceVisible, setIsAppearanceVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appearancePreferences, setAppearancePreferences] = useState<AppearancePreferences>(
    defaultAppearancePreferences,
  );

  const loadAppearancePreferences = useCallback(async () => {
    setIsLoading(true);

    const result = await getAppearancePreferencesUseCase.execute();

    if (!result.success) {
      setAppearancePreferences(defaultAppearancePreferences);
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    setAppearancePreferences(result.value);
    setErrorMessage(null);
    setIsLoading(false);
  }, [getAppearancePreferencesUseCase]);

  useEffect(() => {
    void loadAppearancePreferences();
  }, [loadAppearancePreferences]);

  const persistAppearancePreferences = useCallback(
    async (nextPreferences: SaveAppearancePreferencesPayload) => {
      setIsSaving(true);
      const previousPreferences = appearancePreferences;

      setAppearancePreferences((currentPreferences) => ({
        ...currentPreferences,
        ...nextPreferences,
      }));

      const result = await saveAppearancePreferencesUseCase.execute(
        nextPreferences,
      );

      if (!result.success) {
        setAppearancePreferences(previousPreferences);
        setErrorMessage(result.error.message);
        setIsSaving(false);
        return;
      }

      setAppearancePreferences(result.value);
      setErrorMessage(null);
      setIsSaving(false);
    },
    [appearancePreferences, saveAppearancePreferencesUseCase],
  );

  const onOpenAppearance = useCallback(() => {
    setErrorMessage(null);
    setIsAppearanceVisible(true);
  }, []);

  const onCloseAppearance = useCallback(() => {
    setIsAppearanceVisible(false);
  }, []);

  const onSelectThemePreference = useCallback(
    async (value: AppearanceThemePreferenceValue) => {
      if (value === appearancePreferences.themePreference) {
        return;
      }

      await persistAppearancePreferences({
        themePreference: value,
        textSizePreference: appearancePreferences.textSizePreference,
        compactModeEnabled: appearancePreferences.compactModeEnabled,
      });
    },
    [appearancePreferences, persistAppearancePreferences],
  );

  const onSelectTextSizePreference = useCallback(
    async (value: AppearanceTextSizePreferenceValue) => {
      if (value === appearancePreferences.textSizePreference) {
        return;
      }

      await persistAppearancePreferences({
        themePreference: appearancePreferences.themePreference,
        textSizePreference: value,
        compactModeEnabled: appearancePreferences.compactModeEnabled,
      });
    },
    [appearancePreferences, persistAppearancePreferences],
  );

  const onToggleCompactMode = useCallback(
    async (value: boolean) => {
      if (value === appearancePreferences.compactModeEnabled) {
        return;
      }

      await persistAppearancePreferences({
        themePreference: appearancePreferences.themePreference,
        textSizePreference: appearancePreferences.textSizePreference,
        compactModeEnabled: value,
      });
    },
    [appearancePreferences, persistAppearancePreferences],
  );

  return useMemo(
    () => ({
      isLoading,
      isSaving,
      isAppearanceVisible,
      errorMessage,
      appearanceSummaryLabel: buildAppearanceSummaryLabel(appearancePreferences),
      selectedThemePreference: appearancePreferences.themePreference,
      selectedTextSizePreference: appearancePreferences.textSizePreference,
      compactModeEnabled: appearancePreferences.compactModeEnabled,
      settingsSectionTitle: "Preferences",
      appearanceTitle: "Appearance",
      appearanceSubtitle: "Theme, text size, and compact mode",
      appearanceModalTitle: "Appearance",
      appearanceModalSubtitle: "Changes are saved automatically.",
      compactModeTitle: "Compact Mode",
      compactModeSubtitle: "Reduce spacing for more content",
      onRefresh: loadAppearancePreferences,
      onOpenAppearance,
      onCloseAppearance,
      onSelectThemePreference,
      onSelectTextSizePreference,
      onToggleCompactMode,
    }),
    [
      appearancePreferences,
      errorMessage,
      isAppearanceVisible,
      isLoading,
      isSaving,
      loadAppearancePreferences,
      onCloseAppearance,
      onOpenAppearance,
      onSelectTextSizePreference,
      onSelectThemePreference,
      onToggleCompactMode,
    ],
  );
};

