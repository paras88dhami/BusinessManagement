import React, { ReactNode } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type ProfileFieldProps = {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (nextValue: string) => void;
  placeholder: string;
  autoCapitalize: "none" | "sentences" | "words" | "characters";
  keyboardType: TextInputProps["keyboardType"];
  multiline: boolean;
  numberOfLines: number;
  autoComplete: TextInputProps["autoComplete"] | null;
  textContentType: TextInputProps["textContentType"] | null;
  icon: ReactNode | null;
  isLast: boolean;
  errorText?: string;
};

export function ProfileField({
  label,
  value,
  editable,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
  multiline,
  numberOfLines,
  autoComplete,
  textContentType,
  icon,
  isLast,
  errorText,
}: ProfileFieldProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.row, !isLast ? styles.rowDivider : null]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.contentWrap}>
        <Text style={styles.label}>{label}</Text>
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoComplete={autoComplete ?? undefined}
            textContentType={textContentType ?? undefined}
            placeholderTextColor={theme.colors.mutedForeground}
            style={[styles.input, multiline ? styles.inputMultiline : null]}
            textAlignVertical={multiline ? "top" : "center"}
          />
        ) : (
          <Text style={styles.value}>{value || "-"}</Text>
        )}
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(12),
    backgroundColor: theme.colors.card,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconWrap: {
    marginTop: theme.scaleSpace(3),
    width: theme.scaleSpace(20),
    alignItems: "center",
  },
  contentWrap: {
    flex: 1,
    gap: theme.scaleSpace(2),
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  value: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    lineHeight: theme.scaleLineHeight(20),
    fontFamily: "InterSemiBold",
  },
  input: {
    marginTop: -1,
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    lineHeight: theme.scaleLineHeight(20),
    fontFamily: "InterSemiBold",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inputMultiline: {
    minHeight: theme.scaleSpace(68),
    paddingTop: theme.scaleSpace(2),
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(12),
    lineHeight: theme.scaleLineHeight(16),
    fontFamily: "InterMedium",
    marginTop: theme.scaleSpace(2),
  },
});
