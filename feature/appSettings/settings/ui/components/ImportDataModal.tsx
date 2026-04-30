import { SettingsViewModel } from "@/feature/appSettings/settings/viewModel/settings.viewModel";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { Clock3, Upload } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SettingsDataTransferModuleValue } from "../../types/settings.types";

type ImportDataModalProps = {
  visible: boolean;
  subtitle: string;
  unavailableMessage: string;
  moduleOptions: SettingsViewModel["importDataModuleOptions"];
  isImporting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onImportModule: (id: SettingsDataTransferModuleValue) => Promise<void>;
};

export function ImportDataModal({
  visible,
  subtitle,
  unavailableMessage,
  moduleOptions,
  isImporting,
  errorMessage,
  onClose,
  onImportModule,
}: ImportDataModalProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          gap: theme.scaleSpace(spacing.md),
        },
        sectionBlock: {
          gap: theme.scaleSpace(spacing.sm),
        },
        sectionLabel: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          fontFamily: "InterBold",
          letterSpacing: 0.3,
        },
        moduleList: {
          gap: theme.scaleSpace(spacing.sm),
        },
        moduleRow: {
          minHeight: theme.scaleSpace(58),
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondary,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
          paddingHorizontal: theme.scaleSpace(spacing.md),
        },
        moduleRowDisabled: {
          opacity: 0.72,
        },
        moduleTextWrap: {
          flex: 1,
        },
        moduleLabel: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(17),
          fontFamily: "InterMedium",
        },
        moduleMeta: {
          marginTop: 2,
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterMedium",
        },
        supportCard: {
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.accent,
          paddingHorizontal: theme.scaleSpace(spacing.md),
          paddingVertical: theme.scaleSpace(spacing.md),
          gap: theme.scaleSpace(6),
        },
        supportHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(8),
        },
        supportTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(16),
          fontFamily: "InterBold",
        },
        supportBody: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(20),
          fontFamily: "InterMedium",
        },
        infoText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          fontFamily: "InterMedium",
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(12),
          fontFamily: "InterSemiBold",
        },
      }),
    [theme],
  );

  return (
    <FormSheetModal
      visible={visible}
      title="Import Data"
      subtitle={subtitle}
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
              style={[
                styles.moduleRow,
                moduleOption.disabled ? styles.moduleRowDisabled : null,
              ]}
              onPress={() => {
                void onImportModule(moduleOption.id);
              }}
              accessibilityRole="button"
              disabled={isImporting || moduleOption.disabled}
            >
              <View style={styles.moduleTextWrap}>
                <Text style={styles.moduleLabel}>{moduleOption.label}</Text>
                {moduleOption.statusLabel || moduleOption.description ? (
                  <Text style={styles.moduleMeta}>
                    {[moduleOption.statusLabel, moduleOption.description]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                ) : null}
              </View>
              {moduleOption.disabled ? (
                <Clock3 size={17} color={theme.colors.mutedForeground} />
              ) : (
                <Upload size={17} color={theme.colors.mutedForeground} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.supportCard}>
        <View style={styles.supportHeader}>
          <Clock3 size={16} color={theme.colors.primary} />
          <Text style={styles.supportTitle}>Import Availability</Text>
        </View>
        <Text style={styles.supportBody}>{unavailableMessage}</Text>
      </View>

      {isImporting ? (
        <Text style={styles.infoText}>Importing selected file...</Text>
      ) : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </FormSheetModal>
  );
}
