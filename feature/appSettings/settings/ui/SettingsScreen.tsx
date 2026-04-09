import { PrimaryHeader } from "@/shared/components/reusable/ScreenLayouts/PrimaryHeader";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
  Bug,
  ChevronRight,
  CircleHelp,
  Download,
  Landmark,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Star,
  Upload,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SettingsRowId, SettingsViewModel } from "../viewModel/settings.viewModel";
import { SettingsModal } from "../types/settings.types";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { HelpFaqModal } from "./components/HelpFaqModal";
import { RateELekhaModal } from "./components/RateELekhaModal";
import { ReportBugModal } from "./components/ReportBugModal";
import { RegionalFinanceModal } from "./components/RegionalFinanceModal";
import { SecurityModal } from "./components/SecurityModal";
import { TermsPrivacyModal } from "./components/TermsPrivacyModal";
import { AppearanceModal } from "@/feature/appSettings/appearance/ui/components/AppearanceModal";
import { ExportDataModal } from "./components/ExportDataModal";
import { ImportDataModal } from "./components/ImportDataModal";

type SettingsScreenProps = {
  viewModel: SettingsViewModel;
  onBack: () => void;
};

const getIcon = (id: SettingsRowId) => {
  switch (id) {
    case "appearance":
      return <Palette size={18} color={colors.primary} />;
    case "security":
      return <LockKeyhole size={18} color={colors.primary} />;
    case "regionalFinance":
      return <Landmark size={18} color={colors.primary} />;
    case "exportData":
      return <Download size={18} color={colors.primary} />;
    case "importData":
      return <Upload size={18} color={colors.primary} />;
    case "helpFaq":
      return <CircleHelp size={18} color={colors.primary} />;
    case "termsPrivacy":
      return <ShieldCheck size={18} color={colors.primary} />;
    case "rateELekha":
      return <Star size={18} color={colors.primary} fill={colors.primary} />;
    case "reportBug":
      return <Bug size={18} color={colors.primary} />;
    default:
      return <LockKeyhole size={18} color={colors.primary} />;
  }
};

export function SettingsScreen({ viewModel, onBack }: SettingsScreenProps) {
  const onRowPress = (id: SettingsRowId): void => {
    switch (id) {
      case "appearance":
        viewModel.onOpenAppearance();
        return;
      case "security":
        viewModel.onOpenSecurity();
        return;
      case "regionalFinance":
        viewModel.onOpenRegionalFinance();
        return;
      case "exportData":
        viewModel.onOpenExportData();
        return;
      case "importData":
        viewModel.onOpenImportData();
        return;
      case "helpFaq":
        viewModel.onOpenHelpFaq();
        return;
      case "termsPrivacy":
        viewModel.onOpenTermsPrivacy();
        return;
      case "rateELekha":
        viewModel.onOpenRateELekha();
        return;
      case "reportBug":
        viewModel.onOpenReportBug();
        return;
      default:
        return;
    }
  };

  return (
    <>
      <ScreenContainer
        header={
          <PrimaryHeader
            title={viewModel.pageTitle}
            showBack={true}
            onBack={onBack}
            showBell={false}
            showProfile={false}
          />
        }
        contentContainerStyle={styles.content}
        baseBottomPadding={spacing.xxl}
      >
        {viewModel.settingsSections.map((section) => (
          <View key={section.id} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <Card style={styles.listCard}>
              {section.rows.map((row, index) => {
                const isLast = index === section.rows.length - 1;

                return (
                  <Pressable
                    key={row.id}
                    style={[styles.row, !isLast ? styles.rowBorder : null]}
                    onPress={() => onRowPress(row.id)}
                    accessibilityRole="button"
                  >
                    <View style={styles.iconWrap}>{getIcon(row.id)}</View>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{row.title}</Text>
                      <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
                      {row.id === "appearance" ? (
                        <Text style={styles.rowValue}>
                          {viewModel.appearanceSummaryLabel}
                        </Text>
                      ) : null}
                      {row.id === "regionalFinance" ? (
                        <Text style={styles.rowValue}>
                          {viewModel.regionalFinanceSummaryLabel}
                        </Text>
                      ) : null}
                    </View>
                    <ChevronRight size={16} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))}

        {viewModel.isLoading ? (
          <View style={styles.feedbackRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.feedbackText}>Loading settings...</Text>
          </View>
        ) : null}

        {viewModel.errorMessage && viewModel.activeModal === SettingsModal.None ? (
          <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
        ) : null}

        {viewModel.successMessage && viewModel.activeModal === SettingsModal.None ? (
          <Text style={styles.successText}>{viewModel.successMessage}</Text>
        ) : null}
      </ScreenContainer>

      <AppearanceModal
        visible={viewModel.activeModal === SettingsModal.Appearance}
        isSaving={viewModel.isSavingAppearance}
        title={viewModel.appearanceModalTitle}
        subtitle={viewModel.appearanceModalSubtitle}
        errorMessage={viewModel.errorMessage}
        selectedThemePreference={viewModel.selectedThemePreference}
        selectedTextSizePreference={viewModel.selectedTextSizePreference}
        compactModeEnabled={viewModel.compactModeEnabled}
        compactModeTitle={viewModel.compactModeTitle}
        compactModeSubtitle={viewModel.compactModeSubtitle}
        onClose={viewModel.onCloseModal}
        onSelectThemePreference={viewModel.onSelectThemePreference}
        onSelectTextSizePreference={viewModel.onSelectTextSizePreference}
        onToggleCompactMode={viewModel.onToggleCompactMode}
      />

      <RegionalFinanceModal
        visible={viewModel.activeModal === SettingsModal.RegionalFinance}
        isSaving={viewModel.isSavingRegionalFinance}
        title={viewModel.regionalFinanceModalTitle}
        subtitle={viewModel.regionalFinanceModalSubtitle}
        errorMessage={viewModel.errorMessage}
        settings={viewModel.regionalFinanceSettings}
        countryOptions={viewModel.regionalFinanceCountryOptions}
        currencyOptions={viewModel.regionalFinanceCurrencyOptions}
        taxRateOptions={viewModel.regionalFinanceTaxRateOptions}
        taxModeOptions={viewModel.regionalFinanceTaxModeOptions}
        onClose={viewModel.onCloseModal}
        onChangeCountry={viewModel.onChangeRegionalFinanceCountry}
        onChangeCurrency={viewModel.onChangeRegionalFinanceCurrency}
        onChangeTaxRate={viewModel.onChangeRegionalFinanceTaxRate}
        onChangeTaxMode={viewModel.onChangeRegionalFinanceTaxMode}
        onSave={viewModel.onSaveRegionalFinance}
      />

      <ExportDataModal
        visible={viewModel.activeModal === SettingsModal.ExportData}
        format={viewModel.exportDataFormat}
        moduleSelections={viewModel.exportDataModuleSelections}
        isExporting={viewModel.isExportingData}
        errorMessage={viewModel.errorMessage}
        onClose={viewModel.onCloseModal}
        onChangeFormat={viewModel.onChangeExportDataFormat}
        onToggleModule={viewModel.onToggleExportDataModule}
        onSubmit={viewModel.onSubmitExportData}
      />

      <ImportDataModal
        visible={viewModel.activeModal === SettingsModal.ImportData}
        moduleOptions={viewModel.importDataModuleOptions}
        isImporting={viewModel.isImportingData}
        errorMessage={viewModel.errorMessage}
        onClose={viewModel.onCloseModal}
        onImportModule={viewModel.onImportDataModule}
      />

      <SecurityModal
        visible={viewModel.activeModal === SettingsModal.Security}
        errorMessage={viewModel.errorMessage}
        successMessage={viewModel.successMessage}
        isSavingPreference={viewModel.isSavingPreference}
        passwordChangedLabel={viewModel.passwordChangedLabel}
        biometricLoginEnabled={viewModel.biometricLoginEnabled}
        twoFactorAuthEnabled={viewModel.twoFactorAuthEnabled}
        securitySessions={viewModel.securitySessions}
        onClose={viewModel.onCloseModal}
        onOpenChangePassword={viewModel.onOpenChangePassword}
        onToggleBiometricLogin={viewModel.onToggleBiometricLogin}
        onToggleTwoFactorAuth={viewModel.onToggleTwoFactorAuth}
      />

      <ChangePasswordModal
        visible={viewModel.activeModal === SettingsModal.ChangePassword}
        form={viewModel.changePasswordForm}
        isSubmitting={viewModel.isChangingPassword}
        errorMessage={viewModel.errorMessage}
        successMessage={viewModel.successMessage}
        onClose={viewModel.onCloseModal}
        onChange={viewModel.onChangePasswordField}
        onSubmit={viewModel.onSubmitPasswordChange}
      />

      <HelpFaqModal
        visible={viewModel.activeModal === SettingsModal.HelpFaq}
        items={viewModel.helpFaqItems}
        supportContacts={viewModel.supportContactItems}
        onClose={viewModel.onCloseModal}
      />

      <TermsPrivacyModal
        visible={viewModel.activeModal === SettingsModal.TermsPrivacy}
        items={viewModel.termsDocumentItems}
        dataRights={viewModel.dataRightItems}
        onClose={viewModel.onCloseModal}
      />

      <RateELekhaModal
        visible={viewModel.activeModal === SettingsModal.RateELekha}
        ratingValue={viewModel.ratingValue}
        review={viewModel.ratingReview}
        isSubmitting={viewModel.isSubmittingRating}
        errorMessage={viewModel.errorMessage}
        successMessage={viewModel.successMessage}
        onClose={viewModel.onCloseModal}
        onSelectRating={viewModel.onSelectRating}
        onReviewChange={viewModel.onRatingReviewChange}
        onSubmit={viewModel.onSubmitRating}
      />

      <ReportBugModal
        visible={viewModel.activeModal === SettingsModal.ReportBug}
        form={viewModel.reportBugForm}
        deviceInfoLabel={viewModel.deviceInfoLabel}
        appVersionLabel={viewModel.appVersionLabel}
        isSubmitting={viewModel.isSubmittingBugReport}
        errorMessage={viewModel.errorMessage}
        successMessage={viewModel.successMessage}
        onClose={viewModel.onCloseModal}
        onChange={viewModel.onReportBugFieldChange}
        onSubmit={viewModel.onSubmitBugReport}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  sectionWrap: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    color: colors.cardForeground,
    fontSize: 15,
    fontFamily: "InterBold",
    marginBottom: 2,
  },
  rowSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "InterMedium",
  },
  rowValue: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  feedbackText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "InterSemiBold",
  },
  successText: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "InterSemiBold",
  },
});
