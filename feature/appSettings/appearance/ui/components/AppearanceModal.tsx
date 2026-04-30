import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Monitor, Moon, Sun } from "lucide-react-native";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
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

const getThemeIcon = (
  value: AppearanceThemePreferenceValue,
  iconColor: string,
) => {
  switch (value) {
    case AppearanceThemePreference.Dark:
      return <Moon size={22} color={iconColor} />;
    case AppearanceThemePreference.System:
      return <Monitor size={22} color={iconColor} />;
    default:
      return <Sun size={22} color={iconColor} />;
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
  const theme = useAppTheme();
  const selectedToneColor = theme.isDarkMode
    ? theme.colors.foreground
    : theme.colors.primary;
  const switchThumbColor = theme.isDarkMode
    ? theme.colors.foreground
    : theme.colors.card;
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          gap: theme.scaleSpace(spacing.md),
        },
        groupWrap: {
          gap: theme.scaleSpace(spacing.sm),
        },
        groupLabel: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          fontFamily: "InterBold",
          letterSpacing: 0.7,
          textTransform: "uppercase",
        },
        optionRow: {
          flexDirection: "row",
          alignItems: "stretch",
          gap: theme.scaleSpace(spacing.xs),
        },
        selectionCard: {
          flex: 1,
          minHeight: theme.scaleSpace(92),
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          backgroundColor: theme.colors.secondary,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: theme.scaleSpace(spacing.xs),
          paddingVertical: theme.scaleSpace(spacing.md),
          gap: theme.scaleSpace(8),
        },
        selectionCardSelected: {
          borderColor: selectedToneColor,
          backgroundColor: theme.colors.accent,
        },
        optionIconWrap: {
          width: theme.scaleSpace(34),
          height: theme.scaleSpace(34),
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.card,
        },
        optionIconWrapSelected: {
          borderWidth: 1,
          borderColor: selectedToneColor,
        },
        previewLabel: {
          color: theme.colors.foreground,
          fontFamily: "InterBold",
        },
        previewSmall: {
          fontSize: theme.scaleText(18),
          lineHeight: theme.scaleLineHeight(22),
        },
        previewMedium: {
          fontSize: theme.scaleText(22),
          lineHeight: theme.scaleLineHeight(26),
        },
        previewLarge: {
          fontSize: theme.scaleText(26),
          lineHeight: theme.scaleLineHeight(30),
        },
        selectionTitle: {
          color: theme.colors.foreground,
          fontSize: theme.scaleText(13),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterSemiBold",
        },
        selectionTitleSelected: {
          color: selectedToneColor,
        },
        toggleCard: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.scaleSpace(spacing.md),
          paddingHorizontal: theme.scaleSpace(spacing.md),
          paddingVertical: theme.scaleSpace(spacing.md),
        },
        toggleTextWrap: {
          flex: 1,
          gap: 2,
        },
        toggleTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(15),
          lineHeight: theme.scaleLineHeight(20),
          fontFamily: "InterBold",
        },
        toggleSubtitle: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
        },
        savingWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
        },
        savingText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterMedium",
        },
      }),
    [selectedToneColor, theme],
  );

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
                  {getThemeIcon(option.value, theme.colors.mutedForeground)}
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
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={switchThumbColor}
        />
      </Card>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {isSaving ? (
        <View style={styles.savingWrap}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={styles.savingText}>Saving changes...</Text>
        </View>
      ) : null}
    </FormSheetModal>
  );
}
