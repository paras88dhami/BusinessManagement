import { getAppearanceSettingsState } from "@/feature/appSettings/data/appSettings.store";
import { AppSettingsModel } from "@/feature/appSettings/data/dataSource/db/appSettings.model";
import {
  AppearancePreferences,
  AppearanceTextSizePreference,
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreference,
  AppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";
import { Database } from "@nozbe/watermelondb";
import * as SystemUI from "expo-system-ui";
import React from "react";
import { useColorScheme } from "react-native";
import { AppColorPalette, darkColors, lightColors, setRuntimeColors } from "./colors";

const APP_SETTINGS_TABLE = "app_settings";

const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
  themePreference: AppearanceThemePreference.Light,
  textSizePreference: AppearanceTextSizePreference.Medium,
  compactModeEnabled: false,
  updatedAt: 0,
};

const TEXT_SCALE_BY_PREFERENCE: Record<
  AppearanceTextSizePreferenceValue,
  number
> = {
  [AppearanceTextSizePreference.Small]: 0.92,
  [AppearanceTextSizePreference.Medium]: 1,
  [AppearanceTextSizePreference.Large]: 1.12,
};

const COMPACT_SPACING_SCALE = 0.84;

const resolveAppearancePreference = (
  preferences: {
    themePreference: string;
    textSizePreference: string;
    compactModeEnabled: boolean;
    updatedAt: number;
  },
): AppearancePreferences => ({
  themePreference:
    preferences.themePreference === AppearanceThemePreference.Dark ||
    preferences.themePreference === AppearanceThemePreference.System
      ? preferences.themePreference
      : AppearanceThemePreference.Light,
  textSizePreference:
    preferences.textSizePreference === AppearanceTextSizePreference.Small ||
    preferences.textSizePreference === AppearanceTextSizePreference.Large
      ? preferences.textSizePreference
      : AppearanceTextSizePreference.Medium,
  compactModeEnabled: preferences.compactModeEnabled,
  updatedAt: preferences.updatedAt,
});

const resolveColorMode = (
  themePreference: AppearanceThemePreferenceValue,
  systemColorScheme: ReturnType<typeof useColorScheme>,
): "light" | "dark" => {
  if (themePreference === AppearanceThemePreference.System) {
    return systemColorScheme === "dark" ? "dark" : "light";
  }

  return themePreference === AppearanceThemePreference.Dark ? "dark" : "light";
};

export type AppThemeContextValue = {
  colorMode: "light" | "dark";
  colors: AppColorPalette;
  preferences: AppearancePreferences;
  compactModeEnabled: boolean;
  isDarkMode: boolean;
  scaleText: (value: number) => number;
  scaleLineHeight: (value: number) => number;
  scaleSpace: (value: number) => number;
};

const createDefaultScaleText = (value: number): number => value;
const createDefaultScaleLineHeight = (value: number): number => value;
const createDefaultScaleSpace = (value: number): number => value;

const DEFAULT_CONTEXT: AppThemeContextValue = {
  colorMode: "light",
  colors: lightColors,
  preferences: DEFAULT_APPEARANCE_PREFERENCES,
  compactModeEnabled: false,
  isDarkMode: false,
  scaleText: createDefaultScaleText,
  scaleLineHeight: createDefaultScaleLineHeight,
  scaleSpace: createDefaultScaleSpace,
};

const AppThemeContext = React.createContext<AppThemeContextValue>(DEFAULT_CONTEXT);

type AppThemeProviderProps = {
  database: Database;
  children: React.ReactNode;
};

export function AppThemeProvider({
  database,
  children,
}: AppThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [preferences, setPreferences] = React.useState<AppearancePreferences>(
    DEFAULT_APPEARANCE_PREFERENCES,
  );

  React.useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const syncPreferences = async (): Promise<void> => {
      try {
        const appearanceState = await getAppearanceSettingsState(database);
        if (!isMounted) {
          return;
        }

        setPreferences(resolveAppearancePreference(appearanceState));
      } catch {
        if (!isMounted) {
          return;
        }

        setPreferences(DEFAULT_APPEARANCE_PREFERENCES);
      }
    };

    void syncPreferences();

    try {
      const appSettingsCollection =
        database.get<AppSettingsModel>(APP_SETTINGS_TABLE);
      const subscription = appSettingsCollection
        .query()
        .observeWithColumns([
          "appearance_theme_preference",
          "appearance_text_size_preference",
          "appearance_compact_mode_enabled",
        ])
        .subscribe(() => {
          void syncPreferences();
        });

      unsubscribe = () => {
        subscription.unsubscribe();
      };
    } catch {
      unsubscribe = null;
    }

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [database]);

  const themeValue = React.useMemo<AppThemeContextValue>(() => {
    const colorMode = resolveColorMode(
      preferences.themePreference,
      systemColorScheme,
    );
    const palette = colorMode === "dark" ? darkColors : lightColors;
    const textScale =
      TEXT_SCALE_BY_PREFERENCE[preferences.textSizePreference] ?? 1;
    const spacingScale = preferences.compactModeEnabled
      ? COMPACT_SPACING_SCALE
      : 1;

    const scaleText = (value: number): number =>
      Math.round(value * textScale * 10) / 10;
    const scaleLineHeight = (value: number): number =>
      Math.max(Math.round(value * textScale), 1);
    const scaleSpace = (value: number): number =>
      Math.max(Math.round(value * spacingScale), 4);

    return {
      colorMode,
      colors: palette,
      preferences,
      compactModeEnabled: preferences.compactModeEnabled,
      isDarkMode: colorMode === "dark",
      scaleText,
      scaleLineHeight,
      scaleSpace,
    };
  }, [preferences, systemColorScheme]);

  React.useEffect(() => {
    setRuntimeColors(themeValue.colors);
    void SystemUI.setBackgroundColorAsync(themeValue.colors.background).catch(
      () => undefined,
    );
  }, [themeValue.colors]);

  return (
    <AppThemeContext.Provider value={themeValue}>
      {children}
    </AppThemeContext.Provider>
  );
}

export const useAppTheme = (): AppThemeContextValue => {
  return React.useContext(AppThemeContext);
};
