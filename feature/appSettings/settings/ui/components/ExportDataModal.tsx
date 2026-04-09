import { SettingsViewModel } from "@/feature/appSettings/settings/viewModel/settings.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Check, Download } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SettingsDataTransferFormat,
  SettingsDataTransferFormatValue,
  SettingsDataTransferModuleValue,
} from "../../types/settings.types";

type ExportDataModalProps = {
  visible: boolean;
  format: SettingsDataTransferFormatValue;
  moduleSelections: SettingsViewModel["exportDataModuleSelections"];
  isExporting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onChangeFormat: (value: SettingsDataTransferFormatValue) => void;
  onToggleModule: (id: SettingsDataTransferModuleValue) => void;
  onSubmit: () => Promise<void>;
};

const FormatToggleButton = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    style={[styles.formatButton, active ? styles.formatButtonActive : null]}
    onPress={onPress}
    accessibilityRole="button"
  >
    <Text style={[styles.formatLabel, active ? styles.formatLabelActive : null]}>
      {label}
    </Text>
  </Pressable>
);

export function ExportDataModal({
  visible,
  format,
  moduleSelections,
  isExporting,
  errorMessage,
  onClose,
  onChangeFormat,
  onToggleModule,
  onSubmit,
}: ExportDataModalProps) {
  return (
    <FormSheetModal
      visible={visible}
      title="Export Data"
      subtitle="Export all your business data as a downloadable file."
      onClose={onClose}
      closeAccessibilityLabel="Close export data"
      presentation="dialog"
      contentContainerStyle={styles.content}
      footer={
        <AppButton
          label={isExporting ? "Exporting..." : "Export Data"}
          size="lg"
          leadingIcon={<Download size={16} color={colors.primaryForeground} />}
          onPress={() => {
            void onSubmit();
          }}
          disabled={isExporting}
          style={styles.exportButton}
        />
      }
    >
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>FORMAT</Text>
        <View style={styles.formatRow}>
          <FormatToggleButton
            active={format === SettingsDataTransferFormat.Csv}
            label="CSV"
            onPress={() => onChangeFormat(SettingsDataTransferFormat.Csv)}
          />
          <FormatToggleButton
            active={format === SettingsDataTransferFormat.Json}
            label="JSON"
            onPress={() => onChangeFormat(SettingsDataTransferFormat.Json)}
          />
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>DATA TO EXPORT</Text>
        <View style={styles.moduleList}>
          {moduleSelections.map((selection) => (
            <Pressable
              key={selection.id}
              style={styles.moduleRow}
              onPress={() => onToggleModule(selection.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selection.selected }}
            >
              <View
                style={[
                  styles.checkbox,
                  selection.selected ? styles.checkboxActive : null,
                ]}
              >
                {selection.selected ? <Check size={14} color={colors.card} /> : null}
              </View>
              <Text style={styles.moduleLabel}>{selection.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterBold",
    letterSpacing: 0.3,
  },
  formatRow: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formatButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  formatButtonActive: {
    backgroundColor: colors.primary,
  },
  formatLabel: {
    color: colors.cardForeground,
    fontSize: 16,
    fontFamily: "InterBold",
  },
  formatLabelActive: {
    color: colors.primaryForeground,
  },
  moduleList: {
    gap: spacing.sm,
  },
  moduleRow: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  moduleLabel: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: 17,
    fontFamily: "InterMedium",
  },
  exportButton: {
    width: "100%",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
});

