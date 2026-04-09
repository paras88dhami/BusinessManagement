import { Result } from "@/shared/types/result.types";

export const AppearanceThemePreference = {
  Light: "light",
  Dark: "dark",
  System: "system",
} as const;

export type AppearanceThemePreferenceValue =
  (typeof AppearanceThemePreference)[keyof typeof AppearanceThemePreference];

export const AppearanceTextSizePreference = {
  Small: "small",
  Medium: "medium",
  Large: "large",
} as const;

export type AppearanceTextSizePreferenceValue =
  (typeof AppearanceTextSizePreference)[keyof typeof AppearanceTextSizePreference];

export type AppearancePreferences = {
  themePreference: AppearanceThemePreferenceValue;
  textSizePreference: AppearanceTextSizePreferenceValue;
  compactModeEnabled: boolean;
  updatedAt: number;
};

export type SaveAppearancePreferencesPayload = {
  themePreference: AppearanceThemePreferenceValue;
  textSizePreference: AppearanceTextSizePreferenceValue;
  compactModeEnabled: boolean;
};

export const AppearanceErrorType = {
  ValidationError: "VALIDATION_ERROR",
  DataSourceError: "DATASOURCE_ERROR",
  UnknownError: "UNKNOWN_ERROR",
} as const;

export type AppearanceError = {
  type: (typeof AppearanceErrorType)[keyof typeof AppearanceErrorType];
  message: string;
};

export const AppearanceValidationError = (
  message: string,
): AppearanceError => ({
  type: AppearanceErrorType.ValidationError,
  message,
});

export const AppearanceDatasourceError: AppearanceError = {
  type: AppearanceErrorType.DataSourceError,
  message: "Unable to load appearance settings right now. Please try again.",
};

export const AppearanceUnknownError: AppearanceError = {
  type: AppearanceErrorType.UnknownError,
  message: "An unexpected appearance settings error occurred.",
};

export type AppearancePreferencesResult = Result<
  AppearancePreferences,
  AppearanceError
>;

export const APPEARANCE_THEME_OPTIONS: readonly {
  value: AppearanceThemePreferenceValue;
  label: string;
  description: string;
}[] = [
  {
    value: AppearanceThemePreference.Light,
    label: "Light",
    description: "Bright default theme",
  },
  {
    value: AppearanceThemePreference.Dark,
    label: "Dark",
    description: "Low-light friendly theme",
  },
  {
    value: AppearanceThemePreference.System,
    label: "System",
    description: "Follow device setting",
  },
] as const;

export const APPEARANCE_TEXT_SIZE_OPTIONS: readonly {
  value: AppearanceTextSizePreferenceValue;
  label: string;
  previewLabel: string;
}[] = [
  {
    value: AppearanceTextSizePreference.Small,
    label: "Small",
    previewLabel: "Aa",
  },
  {
    value: AppearanceTextSizePreference.Medium,
    label: "Medium",
    previewLabel: "Aa",
  },
  {
    value: AppearanceTextSizePreference.Large,
    label: "Large",
    previewLabel: "Aa",
  },
] as const;

export const isAppearanceThemePreferenceValue = (
  value: string,
): value is AppearanceThemePreferenceValue => {
  return APPEARANCE_THEME_OPTIONS.some((option) => option.value === value);
};

export const isAppearanceTextSizePreferenceValue = (
  value: string,
): value is AppearanceTextSizePreferenceValue => {
  return APPEARANCE_TEXT_SIZE_OPTIONS.some((option) => option.value === value);
};
