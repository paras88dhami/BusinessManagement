import { useCallback, useEffect, useMemo, useState } from "react";
import {
  APPEARANCE_TEXT_SIZE_OPTIONS,
  APPEARANCE_THEME_OPTIONS,
  AppearancePreferences,
  AppearanceTextSizePreference,
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreference,
  AppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";
import { GetAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/getAppearancePreferences.useCase";
import { SaveAppearancePreferencesUseCase } from "@/feature/appSettings/appearance/useCase/saveAppearancePreferences.useCase";
import {
  BUG_SEVERITY_OPTIONS,
  BugSeverity,
  SettingsModal,
  SettingsModalValue,
} from "@/feature/appSettings/settings/types/settings.types";
import { ChangePasswordUseCase } from "../useCase/changePassword.useCase";
import { GetSettingsBootstrapUseCase } from "../useCase/getSettingsBootstrap.useCase";
import { SubmitAppRatingUseCase } from "../useCase/submitAppRating.useCase";
import { SubmitBugReportUseCase } from "../useCase/submitBugReport.useCase";
import { UpdateBiometricLoginPreferenceUseCase } from "../useCase/updateBiometricLoginPreference.useCase";
import { UpdateTwoFactorAuthPreferenceUseCase } from "../useCase/updateTwoFactorAuthPreference.useCase";
import {
  SettingsChangePasswordForm,
  SettingsReportBugForm,
  SettingsViewModel,
} from "./settings.viewModel";

const DEFAULT_REPORT_BUG_FORM: SettingsReportBugForm = {
  title: "",
  description: "",
  severity: BugSeverity.Medium,
};

const DEFAULT_CHANGE_PASSWORD_FORM: SettingsChangePasswordForm = {
  currentPassword: "",
  nextPassword: "",
  confirmPassword: "",
};

const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
  themePreference: AppearanceThemePreference.Light,
  textSizePreference: AppearanceTextSizePreference.Medium,
  compactModeEnabled: false,
  updatedAt: 0,
};

const SETTINGS_ROWS: SettingsViewModel["settingsRows"] = [
  {
    id: "appearance",
    title: "Appearance",
    subtitle: "Theme, text size, and compact mode",
  },
  {
    id: "security",
    title: "Security",
    subtitle: "Password, biometric login, active sessions",
  },
  {
    id: "helpFaq",
    title: "Help & FAQ",
    subtitle: "Guides, tutorials, contact",
  },
  {
    id: "termsPrivacy",
    title: "Terms & Privacy",
    subtitle: "Terms, privacy policy, data rights",
  },
  {
    id: "rateELekha",
    title: "Rate e-Lekha",
    subtitle: "Share your experience with the app",
  },
  {
    id: "reportBug",
    title: "Report a Bug",
    subtitle: "Tell us what went wrong",
  },
] as const;

const themeLabelMap: Record<AppearanceThemePreferenceValue, string> =
  APPEARANCE_THEME_OPTIONS.reduce(
    (map, option) => ({
      ...map,
      [option.value]: option.label,
    }),
    {
      [AppearanceThemePreference.Light]: "Light",
      [AppearanceThemePreference.Dark]: "Dark",
      [AppearanceThemePreference.System]: "System",
    } as Record<AppearanceThemePreferenceValue, string>,
  );

const textSizeLabelMap: Record<AppearanceTextSizePreferenceValue, string> =
  APPEARANCE_TEXT_SIZE_OPTIONS.reduce(
    (map, option) => ({
      ...map,
      [option.value]: option.label,
    }),
    {
      [AppearanceTextSizePreference.Small]: "Small",
      [AppearanceTextSizePreference.Medium]: "Medium",
      [AppearanceTextSizePreference.Large]: "Large",
    } as Record<AppearanceTextSizePreferenceValue, string>,
  );

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

const formatRelativeLabel = (timestamp: number | null): string => {
  if (timestamp === null) {
    return "Last changed unavailable";
  }

  const elapsedMs = Math.max(Date.now() - timestamp, 0);
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
  const elapsedHours = Math.floor(elapsedMs / (60 * 60 * 1000));
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));

  if (elapsedMinutes < 1) {
    return "Last changed just now";
  }

  if (elapsedMinutes < 60) {
    return `Last changed ${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  if (elapsedHours < 24) {
    return `Last changed ${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  return `Last changed ${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
};

type Params = {
  activeUserRemoteId: string | null;
  getAppearancePreferencesUseCase: GetAppearancePreferencesUseCase;
  saveAppearancePreferencesUseCase: SaveAppearancePreferencesUseCase;
  getSettingsBootstrapUseCase: GetSettingsBootstrapUseCase;
  updateBiometricLoginPreferenceUseCase: UpdateBiometricLoginPreferenceUseCase;
  updateTwoFactorAuthPreferenceUseCase: UpdateTwoFactorAuthPreferenceUseCase;
  submitBugReportUseCase: SubmitBugReportUseCase;
  submitAppRatingUseCase: SubmitAppRatingUseCase;
  changePasswordUseCase: ChangePasswordUseCase;
};

export const useSettingsViewModel = ({
  activeUserRemoteId,
  getAppearancePreferencesUseCase,
  saveAppearancePreferencesUseCase,
  getSettingsBootstrapUseCase,
  updateBiometricLoginPreferenceUseCase,
  updateTwoFactorAuthPreferenceUseCase,
  submitBugReportUseCase,
  submitAppRatingUseCase,
  changePasswordUseCase,
}: Params): SettingsViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [isSubmittingBugReport, setIsSubmittingBugReport] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeModal, setActiveModal] = useState<SettingsModalValue>(
    SettingsModal.None,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helpFaqItems, setHelpFaqItems] = useState<
    SettingsViewModel["helpFaqItems"]
  >([]);
  const [supportContactItems, setSupportContactItems] = useState<
    SettingsViewModel["supportContactItems"]
  >([]);
  const [termsDocumentItems, setTermsDocumentItems] = useState<
    SettingsViewModel["termsDocumentItems"]
  >([]);
  const [dataRightItems, setDataRightItems] = useState<
    SettingsViewModel["dataRightItems"]
  >([]);
  const [securitySessions, setSecuritySessions] = useState<
    SettingsViewModel["securitySessions"]
  >([]);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(false);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);
  const [appearancePreferences, setAppearancePreferences] =
    useState<AppearancePreferences>(DEFAULT_APPEARANCE_PREFERENCES);
  const [passwordChangedAt, setPasswordChangedAt] = useState<number | null>(null);
  const [deviceInfoLabel, setDeviceInfoLabel] = useState("Unavailable");
  const [appVersionLabel, setAppVersionLabel] = useState("Unavailable");
  const [reportBugForm, setReportBugForm] = useState<SettingsReportBugForm>(
    DEFAULT_REPORT_BUG_FORM,
  );
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingReview, setRatingReview] = useState("");
  const [changePasswordForm, setChangePasswordForm] =
    useState<SettingsChangePasswordForm>(DEFAULT_CHANGE_PASSWORD_FORM);

  const loadSettings = useCallback(async () => {
    if (!activeUserRemoteId) {
      setErrorMessage("Settings require an active user session.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [bootstrapResult, appearanceResult] = await Promise.all([
      getSettingsBootstrapUseCase.execute(activeUserRemoteId),
      getAppearancePreferencesUseCase.execute(),
    ]);

    if (!bootstrapResult.success) {
      setErrorMessage(bootstrapResult.error.message);
      setIsLoading(false);
      return;
    }

    setHelpFaqItems(bootstrapResult.value.helpFaqItems);
    setSupportContactItems(bootstrapResult.value.supportContactItems);
    setTermsDocumentItems(bootstrapResult.value.termsDocumentItems);
    setDataRightItems(bootstrapResult.value.dataRightItems);
    setSecuritySessions(bootstrapResult.value.securitySessions);
    setBiometricLoginEnabled(
      bootstrapResult.value.securityPreferences.biometricLoginEnabled,
    );
    setTwoFactorAuthEnabled(
      bootstrapResult.value.securityPreferences.twoFactorAuthEnabled,
    );
    setPasswordChangedAt(bootstrapResult.value.passwordChangedAt);
    setDeviceInfoLabel(bootstrapResult.value.deviceInfo ?? "Unavailable");
    setAppVersionLabel(bootstrapResult.value.appVersion ?? "Unavailable");

    if (!appearanceResult.success) {
      setAppearancePreferences(DEFAULT_APPEARANCE_PREFERENCES);
      setErrorMessage(appearanceResult.error.message);
      setIsLoading(false);
      return;
    }

    setAppearancePreferences(appearanceResult.value);
    setErrorMessage(null);
    setIsLoading(false);
  }, [
    activeUserRemoteId,
    getAppearancePreferencesUseCase,
    getSettingsBootstrapUseCase,
  ]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const onCloseModal = useCallback(() => {
    setActiveModal(SettingsModal.None);
    setErrorMessage(null);
  }, []);

  const onOpenAppearance = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveModal(SettingsModal.Appearance);
  }, []);

  const onOpenSecurity = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveModal(SettingsModal.Security);
  }, []);

  const onOpenHelpFaq = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveModal(SettingsModal.HelpFaq);
  }, []);

  const onOpenTermsPrivacy = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveModal(SettingsModal.TermsPrivacy);
  }, []);

  const onOpenRateELekha = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveModal(SettingsModal.RateELekha);
  }, []);

  const onOpenReportBug = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveModal(SettingsModal.ReportBug);
  }, []);

  const onOpenChangePassword = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setChangePasswordForm(DEFAULT_CHANGE_PASSWORD_FORM);
    setActiveModal(SettingsModal.ChangePassword);
  }, []);

  const persistAppearancePreferences = useCallback(
    async (nextPreferences: {
      themePreference: AppearanceThemePreferenceValue;
      textSizePreference: AppearanceTextSizePreferenceValue;
      compactModeEnabled: boolean;
    }) => {
      setIsSavingAppearance(true);
      const previousPreferences = appearancePreferences;

      setAppearancePreferences((currentPreferences) => ({
        ...currentPreferences,
        ...nextPreferences,
        updatedAt: Date.now(),
      }));

      const result = await saveAppearancePreferencesUseCase.execute(
        nextPreferences,
      );

      if (!result.success) {
        setAppearancePreferences(previousPreferences);
        setErrorMessage(result.error.message);
        setIsSavingAppearance(false);
        return;
      }

      setAppearancePreferences(result.value);
      setErrorMessage(null);
      setSuccessMessage("Appearance settings updated.");
      setIsSavingAppearance(false);
    },
    [appearancePreferences, saveAppearancePreferencesUseCase],
  );

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

  const onToggleBiometricLogin = useCallback(
    async (value: boolean) => {
      setIsSavingPreference(true);
      const result = await updateBiometricLoginPreferenceUseCase.execute(value);

      if (!result.success) {
        setErrorMessage(result.error.message);
        setIsSavingPreference(false);
        return;
      }

      setBiometricLoginEnabled(value);
      setErrorMessage(null);
      setSuccessMessage(
        value
          ? "Biometric login preference updated."
          : "Biometric login preference disabled.",
      );
      setIsSavingPreference(false);
    },
    [updateBiometricLoginPreferenceUseCase],
  );

  const onToggleTwoFactorAuth = useCallback(
    async (value: boolean) => {
      setIsSavingPreference(true);
      const result = await updateTwoFactorAuthPreferenceUseCase.execute(value);

      if (!result.success) {
        setErrorMessage(result.error.message);
        setIsSavingPreference(false);
        return;
      }

      setTwoFactorAuthEnabled(value);
      setErrorMessage(null);
      setSuccessMessage(
        value
          ? "Two-factor auth preference updated."
          : "Two-factor auth preference disabled.",
      );
      setIsSavingPreference(false);
    },
    [updateTwoFactorAuthPreferenceUseCase],
  );

  const onReportBugFieldChange = useCallback(
    (field: keyof SettingsReportBugForm, value: string) => {
      setReportBugForm((current) => {
        if (field === "severity") {
          const matchedValue =
            BUG_SEVERITY_OPTIONS.find((option) => option.value === value)
              ?.value ?? current.severity;

          return {
            ...current,
            severity: matchedValue,
          };
        }

        return {
          ...current,
          [field]: value,
        };
      });
      setErrorMessage(null);
    },
    [],
  );

  const onSubmitBugReport = useCallback(async () => {
    if (!activeUserRemoteId) {
      setErrorMessage("An active user is required to report a bug.");
      return;
    }

    setIsSubmittingBugReport(true);
    const result = await submitBugReportUseCase.execute({
      userRemoteId: activeUserRemoteId,
      title: reportBugForm.title,
      description: reportBugForm.description,
      severity: reportBugForm.severity,
      deviceInfo: deviceInfoLabel === "Unavailable" ? null : deviceInfoLabel,
      appVersion: appVersionLabel === "Unavailable" ? null : appVersionLabel,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      setIsSubmittingBugReport(false);
      return;
    }

    setReportBugForm(DEFAULT_REPORT_BUG_FORM);
    setErrorMessage(null);
    setSuccessMessage("Bug report submitted successfully.");
    setIsSubmittingBugReport(false);
    setActiveModal(SettingsModal.None);
  }, [
    activeUserRemoteId,
    appVersionLabel,
    deviceInfoLabel,
    reportBugForm.description,
    reportBugForm.severity,
    reportBugForm.title,
    submitBugReportUseCase,
  ]);

  const onSelectRating = useCallback((value: number) => {
    setRatingValue(value);
    setErrorMessage(null);
  }, []);

  const onRatingReviewChange = useCallback((value: string) => {
    setRatingReview(value);
    setErrorMessage(null);
  }, []);

  const onSubmitRating = useCallback(async () => {
    if (!activeUserRemoteId) {
      setErrorMessage("An active user is required to rate e-Lekha.");
      return;
    }

    setIsSubmittingRating(true);
    const result = await submitAppRatingUseCase.execute({
      userRemoteId: activeUserRemoteId,
      starCount: ratingValue,
      review: ratingReview,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      setIsSubmittingRating(false);
      return;
    }

    setRatingValue(0);
    setRatingReview("");
    setErrorMessage(null);
    setSuccessMessage("Thanks for rating e-Lekha.");
    setIsSubmittingRating(false);
    setActiveModal(SettingsModal.None);
  }, [activeUserRemoteId, ratingReview, ratingValue, submitAppRatingUseCase]);

  const onChangePasswordField = useCallback(
    (field: keyof SettingsChangePasswordForm, value: string) => {
      setChangePasswordForm((current) => ({
        ...current,
        [field]: value,
      }));
      setErrorMessage(null);
    },
    [],
  );

  const onSubmitPasswordChange = useCallback(async () => {
    if (!activeUserRemoteId) {
      setErrorMessage("An active user is required to change password.");
      return;
    }

    setIsChangingPassword(true);
    const result = await changePasswordUseCase.execute({
      userRemoteId: activeUserRemoteId,
      currentPassword: changePasswordForm.currentPassword,
      nextPassword: changePasswordForm.nextPassword,
      confirmPassword: changePasswordForm.confirmPassword,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      setIsChangingPassword(false);
      return;
    }

    setChangePasswordForm(DEFAULT_CHANGE_PASSWORD_FORM);
    setPasswordChangedAt(Date.now());
    setErrorMessage(null);
    setSuccessMessage("Password changed successfully.");
    setIsChangingPassword(false);
    setActiveModal(SettingsModal.Security);
  }, [activeUserRemoteId, changePasswordForm, changePasswordUseCase]);

  return useMemo(
    () => ({
      isLoading,
      isSavingPreference,
      isSavingAppearance,
      isSubmittingBugReport,
      isSubmittingRating,
      isChangingPassword,
      activeModal,
      errorMessage,
      successMessage,
      pageTitle: "Settings",
      sectionTitle: "Support & Preferences",
      settingsRows: SETTINGS_ROWS,
      appearanceSummaryLabel: buildAppearanceSummaryLabel(appearancePreferences),
      selectedThemePreference: appearancePreferences.themePreference,
      selectedTextSizePreference: appearancePreferences.textSizePreference,
      compactModeEnabled: appearancePreferences.compactModeEnabled,
      appearanceModalTitle: "Appearance",
      appearanceModalSubtitle: "Changes are saved automatically.",
      compactModeTitle: "Compact Mode",
      compactModeSubtitle: "Reduce spacing for more content",
      helpFaqItems,
      supportContactItems,
      termsDocumentItems,
      dataRightItems,
      securitySessions,
      biometricLoginEnabled,
      twoFactorAuthEnabled,
      passwordChangedLabel: formatRelativeLabel(passwordChangedAt),
      deviceInfoLabel,
      appVersionLabel,
      reportBugForm,
      ratingValue,
      ratingReview,
      changePasswordForm,
      canOpenSecurity: Boolean(activeUserRemoteId),
      onOpenAppearance,
      onOpenSecurity,
      onOpenHelpFaq,
      onOpenTermsPrivacy,
      onOpenRateELekha,
      onOpenReportBug,
      onOpenChangePassword,
      onCloseModal,
      onToggleBiometricLogin,
      onToggleTwoFactorAuth,
      onSelectThemePreference,
      onSelectTextSizePreference,
      onToggleCompactMode,
      onReportBugFieldChange,
      onSubmitBugReport,
      onSelectRating,
      onRatingReviewChange,
      onSubmitRating,
      onChangePasswordField,
      onSubmitPasswordChange,
    }),
    [
      activeModal,
      activeUserRemoteId,
      appVersionLabel,
      appearancePreferences,
      biometricLoginEnabled,
      changePasswordForm,
      dataRightItems,
      deviceInfoLabel,
      errorMessage,
      helpFaqItems,
      isChangingPassword,
      isLoading,
      isSavingAppearance,
      isSavingPreference,
      isSubmittingBugReport,
      isSubmittingRating,
      onChangePasswordField,
      onCloseModal,
      onOpenAppearance,
      onOpenChangePassword,
      onOpenHelpFaq,
      onOpenRateELekha,
      onOpenReportBug,
      onOpenSecurity,
      onOpenTermsPrivacy,
      onRatingReviewChange,
      onReportBugFieldChange,
      onSelectRating,
      onSelectTextSizePreference,
      onSelectThemePreference,
      onSubmitBugReport,
      onSubmitPasswordChange,
      onSubmitRating,
      onToggleBiometricLogin,
      onToggleCompactMode,
      onToggleTwoFactorAuth,
      passwordChangedAt,
      ratingReview,
      ratingValue,
      reportBugForm,
      securitySessions,
      successMessage,
      supportContactItems,
      termsDocumentItems,
      twoFactorAuthEnabled,
    ],
  );
};
