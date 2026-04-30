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
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";

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
  placeholderTextColor,
  ...props
}: LabeledTextInputProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: theme.scaleSpace(6),
        },
        label: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(11),
          fontFamily: "InterBold",
          textTransform: "uppercase",
          letterSpacing: 0.45,
        },
        input: {
          minHeight: theme.scaleSpace(50),
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: radius.lg,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.scaleSpace(spacing.md),
          paddingVertical: theme.scaleSpace(12),
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(14),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
        },
        textArea: {
          minHeight: theme.scaleSpace(108),
          paddingTop: theme.scaleSpace(spacing.md),
          paddingBottom: theme.scaleSpace(spacing.md),
        },
        inputDisabled: {
          opacity: 0.72,
        },
        inputError: {
          borderColor: theme.colors.destructive,
        },
        helperText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterMedium",
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(12),
          lineHeight: theme.scaleLineHeight(16),
          fontFamily: "InterSemiBold",
        },
      }),
    [theme],
  );
  const resolvedPlaceholderTextColor =
    placeholderTextColor ?? theme.colors.mutedForeground;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        {...props}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines ?? (multiline ? 4 : 1)}
        placeholderTextColor={resolvedPlaceholderTextColor}
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
