import {
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";
import {
  BugSeverityValue,
  DataRightItem,
  HelpFaqItem,
  SecuritySessionItem,
  SettingsModalValue,
  SupportContactItem,
  TermsDocumentItem,
} from "@/feature/appSettings/settings/types/settings.types";

export type SettingsReportBugForm = {
  title: string;
  description: string;
  severity: BugSeverityValue;
};

export type SettingsChangePasswordForm = {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
};

export interface SettingsViewModel {
  isLoading: boolean;
  isSavingPreference: boolean;
  isSavingAppearance: boolean;
  isSubmittingBugReport: boolean;
  isSubmittingRating: boolean;
  isChangingPassword: boolean;
  activeModal: SettingsModalValue;
  errorMessage: string | null;
  successMessage: string | null;
  pageTitle: string;
  sectionTitle: string;
  settingsRows: readonly {
    id:
      | "appearance"
      | "security"
      | "helpFaq"
      | "termsPrivacy"
      | "rateELekha"
      | "reportBug";
    title: string;
    subtitle: string;
  }[];
  appearanceSummaryLabel: string;
  selectedThemePreference: AppearanceThemePreferenceValue;
  selectedTextSizePreference: AppearanceTextSizePreferenceValue;
  compactModeEnabled: boolean;
  appearanceModalTitle: string;
  appearanceModalSubtitle: string;
  compactModeTitle: string;
  compactModeSubtitle: string;
  helpFaqItems: readonly HelpFaqItem[];
  supportContactItems: readonly SupportContactItem[];
  termsDocumentItems: readonly TermsDocumentItem[];
  dataRightItems: readonly DataRightItem[];
  securitySessions: readonly SecuritySessionItem[];
  biometricLoginEnabled: boolean;
  twoFactorAuthEnabled: boolean;
  passwordChangedLabel: string;
  deviceInfoLabel: string;
  appVersionLabel: string;
  reportBugForm: SettingsReportBugForm;
  ratingValue: number;
  ratingReview: string;
  changePasswordForm: SettingsChangePasswordForm;
  canOpenSecurity: boolean;
  onOpenSecurity: () => void;
  onOpenAppearance: () => void;
  onOpenHelpFaq: () => void;
  onOpenTermsPrivacy: () => void;
  onOpenRateELekha: () => void;
  onOpenReportBug: () => void;
  onOpenChangePassword: () => void;
  onCloseModal: () => void;
  onToggleBiometricLogin: (value: boolean) => Promise<void>;
  onToggleTwoFactorAuth: (value: boolean) => Promise<void>;
  onSelectThemePreference: (
    value: AppearanceThemePreferenceValue,
  ) => Promise<void>;
  onSelectTextSizePreference: (
    value: AppearanceTextSizePreferenceValue,
  ) => Promise<void>;
  onToggleCompactMode: (value: boolean) => Promise<void>;
  onReportBugFieldChange: (
    field: keyof SettingsReportBugForm,
    value: string,
  ) => void;
  onSubmitBugReport: () => Promise<void>;
  onSelectRating: (value: number) => void;
  onRatingReviewChange: (value: string) => void;
  onSubmitRating: () => Promise<void>;
  onChangePasswordField: (
    field: keyof SettingsChangePasswordForm,
    value: string,
  ) => void;
  onSubmitPasswordChange: () => Promise<void>;
}
