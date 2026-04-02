import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

type LabeledTextInputProps = Omit<TextInputProps, "style"> & {
  label: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  helperTextStyle?: StyleProp<TextStyle>;
};

export function LabeledTextInput({
  label,
  helperText,
  errorText,
  containerStyle,
  labelStyle,
  inputStyle,
  helperTextStyle,
  editable = true,
  multiline = false,
  numberOfLines,
  placeholderTextColor = colors.mutedForeground,
  ...props
}: LabeledTextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        {...props}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines ?? (multiline ? 4 : 1)}
        placeholderTextColor={placeholderTextColor}
        style={[
          styles.input,
          multiline ? styles.textArea : null,
          !editable ? styles.inputDisabled : null,
          errorText ? styles.inputError : null,
          inputStyle,
        ]}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, helperTextStyle]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.cardForeground,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "InterMedium",
  },
  textArea: {
    minHeight: 108,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  inputDisabled: {
    opacity: 0.72,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  helperText: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterMedium",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterSemiBold",
  },
});
