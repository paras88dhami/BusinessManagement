import { SettingsViewModel } from "@/feature/appSettings/settings/viewModel/settings.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Dropdown } from "@/shared/components/reusable/DropDown/Dropdown";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type RegionalFinanceModalProps = {
  visible: boolean;
  isSaving: boolean;
  title: string;
  subtitle: string;
  errorMessage: string | null;
  settings: SettingsViewModel["regionalFinanceSettings"];
  countryOptions: SettingsViewModel["regionalFinanceCountryOptions"];
  currencyOptions: SettingsViewModel["regionalFinanceCurrencyOptions"];
  taxRateOptions: SettingsViewModel["regionalFinanceTaxRateOptions"];
  taxModeOptions: SettingsViewModel["regionalFinanceTaxModeOptions"];
  onClose: () => void;
  onChangeCountry: (value: string) => void;
  onChangeCurrency: (value: string) => void;
  onChangeTaxRate: (value: string) => void;
  onChangeTaxMode: (value: string) => void;
  onSave: () => Promise<void>;
};

export function RegionalFinanceModal({
  visible,
  isSaving,
  title,
  subtitle,
  errorMessage,
  settings,
  countryOptions,
  currencyOptions,
  taxRateOptions,
  taxModeOptions,
  onClose,
  onChangeCountry,
  onChangeCurrency,
  onChangeTaxRate,
  onChangeTaxMode,
  onSave,
}: RegionalFinanceModalProps) {
  return (
    <FormSheetModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      closeAccessibilityLabel="Close regional finance settings"
      presentation="dialog"
      contentContainerStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <AppButton
            label="Cancel"
            variant="secondary"
            size="lg"
            style={styles.footerButton}
            onPress={onClose}
          />
          <AppButton
            label={isSaving ? "Saving..." : "Save"}
            size="lg"
            style={styles.footerButton}
            onPress={() => {
              void onSave();
            }}
            disabled={isSaving}
            accessibilityState={{ busy: isSaving }}
          />
        </View>
      }
    >
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Country</Text>
        <Dropdown
          value={settings.countryCode}
          options={countryOptions}
          onChange={onChangeCountry}
          placeholder="Select country"
          modalTitle="Select country"
          showLeadingIcon={false}
          disabled={isSaving}
        />
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Currency</Text>
        <Dropdown
          value={settings.currencyCode}
          options={currencyOptions}
          onChange={onChangeCurrency}
          placeholder="Select currency"
          modalTitle="Select currency"
          showLeadingIcon={false}
          disabled={isSaving}
        />
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Default Tax Rate</Text>
        <Dropdown
          value={String(settings.defaultTaxRatePercent)}
          options={taxRateOptions}
          onChange={onChangeTaxRate}
          placeholder="Select tax rate"
          modalTitle="Select default tax rate"
          showLeadingIcon={false}
          disabled={isSaving}
        />
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Tax Mode</Text>
        <Dropdown
          value={settings.taxMode}
          options={taxModeOptions}
          onChange={onChangeTaxMode}
          placeholder="Select tax mode"
          modalTitle="Select tax mode"
          showLeadingIcon={false}
          disabled={isSaving}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  label: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterSemiBold",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    fontFamily: "InterSemiBold",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
