import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Monitor, Moon, Sun } from "lucide-react-native";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
  APPEARANCE_TEXT_SIZE_OPTIONS,
  APPEARANCE_THEME_OPTIONS,
  AppearanceTextSizePreferenceValue,
  AppearanceThemePreference,
  AppearanceThemePreferenceValue,
} from "@/feature/appSettings/appearance/types/appearance.types";

type AppearanceModalProps = {
  visible: boolean;
  isSaving: boolean;
  title: string;
  subtitle: string;
  errorMessage: string | null;
  selectedThemePreference: AppearanceThemePreferenceValue;
  selectedTextSizePreference: AppearanceTextSizePreferenceValue;
  compactModeEnabled: boolean;
  compactModeTitle: string;
  compactModeSubtitle: string;
  onClose: () => void;
  onSelectThemePreference: (value: AppearanceThemePreferenceValue) => Promise<void>;
  onSelectTextSizePreference: (value: AppearanceTextSizePreferenceValue) => Promise<void>;
  onToggleCompactMode: (value: boolean) => Promise<void>;
};

const getThemeIcon = (value: AppearanceThemePreferenceValue) => {
  switch (value) {
    case AppearanceThemePreference.Dark:
      return <Moon size={22} color={colors.mutedForeground} />;
    case AppearanceThemePreference.System:
      return <Monitor size={22} color={colors.mutedForeground} />;
    default:
      return <Sun size={22} color={colors.mutedForeground} />;
  }
};

export function AppearanceModal({
  visible,
  isSaving,
  title,
  subtitle,
  errorMessage,
  selectedThemePreference,
  selectedTextSizePreference,
  compactModeEnabled,
  compactModeTitle,
  compactModeSubtitle,
  onClose,
  onSelectThemePreference,
  onSelectTextSizePreference,
  onToggleCompactMode,
}: AppearanceModalProps) {
  return (
    <FormSheetModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      presentation="dialog"
      scrollEnabled={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.groupWrap}>
        <Text style={styles.groupLabel}>Theme</Text>
        <View style={styles.optionRow}>
          {APPEARANCE_THEME_OPTIONS.map((option) => {
            const isSelected = option.value === selectedThemePreference;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.selectionCard,
                  isSelected ? styles.selectionCardSelected : null,
                ]}
                onPress={() => {
                  void onSelectThemePreference(option.value);
                }}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.optionIconWrap,
                    isSelected ? styles.optionIconWrapSelected : null,
                  ]}
                >
                  {getThemeIcon(option.value)}
                </View>
                <Text
                  style={[
                    styles.selectionTitle,
                    isSelected ? styles.selectionTitleSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.groupWrap}>
        <Text style={styles.groupLabel}>Text Size</Text>
        <View style={styles.optionRow}>
          {APPEARANCE_TEXT_SIZE_OPTIONS.map((option) => {
            const isSelected = option.value === selectedTextSizePreference;
            const previewStyle =
              option.value === "small"
                ? styles.previewSmall
                : option.value === "large"
                ? styles.previewLarge
                : styles.previewMedium;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.selectionCard,
                  isSelected ? styles.selectionCardSelected : null,
                ]}
                onPress={() => {
                  void onSelectTextSizePreference(option.value);
                }}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.previewLabel,
                    previewStyle,
                    isSelected ? styles.selectionTitleSelected : null,
                  ]}
                >
                  {option.previewLabel}
                </Text>
                <Text
                  style={[
                    styles.selectionTitle,
                    isSelected ? styles.selectionTitleSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card style={styles.toggleCard}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleTitle}>{compactModeTitle}</Text>
          <Text style={styles.toggleSubtitle}>{compactModeSubtitle}</Text>
        </View>
        <Switch
          value={compactModeEnabled}
          onValueChange={(value) => {
            void onToggleCompactMode(value);
          }}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </Card>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {isSaving ? (
        <View style={styles.savingWrap}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.savingText}>Saving changes...</Text>
        </View>
      ) : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  groupWrap: {
    gap: spacing.sm,
  },
  groupLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.xs,
  },
  selectionCard: {
    flex: 1,
    minHeight: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    gap: 8,
  },
  selectionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  optionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  optionIconWrapSelected: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  previewLabel: {
    color: colors.foreground,
    fontFamily: "InterBold",
  },
  previewSmall: {
    fontSize: 18,
  },
  previewMedium: {
    fontSize: 22,
  },
  previewLarge: {
    fontSize: 26,
  },
  selectionTitle: {
    color: colors.foreground,
    fontSize: 13,
    fontFamily: "InterSemiBold",
  },
  selectionTitleSelected: {
    color: colors.primary,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    color: colors.cardForeground,
    fontSize: 15,
    fontFamily: "InterBold",
  },
  toggleSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "InterMedium",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "InterMedium",
  },
  savingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  savingText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
});
