import { SettingsViewModel } from "@/feature/appSettings/settings/viewModel/settings.viewModel";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Upload } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SettingsDataTransferModuleValue } from "../../types/settings.types";

type ImportDataModalProps = {
  visible: boolean;
  moduleOptions: SettingsViewModel["importDataModuleOptions"];
  isImporting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onImportModule: (id: SettingsDataTransferModuleValue) => Promise<void>;
};

export function ImportDataModal({
  visible,
  moduleOptions,
  isImporting,
  errorMessage,
  onClose,
  onImportModule,
}: ImportDataModalProps) {
  return (
    <FormSheetModal
      visible={visible}
      title="Import Data"
      subtitle="Import data from CSV or JSON files into your business."
      onClose={onClose}
      closeAccessibilityLabel="Close import data"
      presentation="bottom-sheet"
      contentContainerStyle={styles.content}
    >
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>IMPORT TO</Text>
        <View style={styles.moduleList}>
          {moduleOptions.map((moduleOption) => (
            <Pressable
              key={moduleOption.id}
              style={styles.moduleRow}
              onPress={() => {
                void onImportModule(moduleOption.id);
              }}
              accessibilityRole="button"
              disabled={isImporting}
            >
              <Text style={styles.moduleLabel}>{moduleOption.label}</Text>
              <Upload size={17} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>Supported Formats</Text>
        <Text style={styles.supportBody}>
          CSV (.csv) and JSON (.json) files. Ensure headers match the expected
          format. Download a template from Export Data first.
        </Text>
      </View>

      {isImporting ? <Text style={styles.infoText}>Importing selected file...</Text> : null}
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
  moduleLabel: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: 17,
    fontFamily: "InterMedium",
  },
  supportCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(31, 99, 64, 0.08)",
    backgroundColor: "#EAF4EF",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 6,
  },
  supportTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontFamily: "InterBold",
  },
  supportBody: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: "InterMedium",
  },
  infoText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    fontFamily: "InterSemiBold",
  },
});
