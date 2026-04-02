import React, { ReactNode } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";

type ProfileFieldProps = {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (nextValue: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: TextInputProps["keyboardType"];
  multiline?: boolean;
  numberOfLines?: number;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  icon?: ReactNode;
  isLast?: boolean;
};

export function ProfileField({
  label,
  value,
  editable,
  onChangeText,
  placeholder,
  autoCapitalize = "none",
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  autoComplete,
  textContentType,
  icon,
  isLast = false,
}: ProfileFieldProps) {
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
            autoComplete={autoComplete}
            textContentType={textContentType}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, multiline ? styles.inputMultiline : null]}
            textAlignVertical={multiline ? "top" : "center"}
          />
        ) : (
          <Text style={styles.value}>{value || "-"}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    marginTop: 3,
    width: 20,
    alignItems: "center",
  },
  contentWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  value: {
    color: colors.cardForeground,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "InterSemiBold",
  },
  input: {
    marginTop: -1,
    color: colors.cardForeground,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "InterSemiBold",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inputMultiline: {
    minHeight: 68,
    paddingTop: 2,
  },
});
