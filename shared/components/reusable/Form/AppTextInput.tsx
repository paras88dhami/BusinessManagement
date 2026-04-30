import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";

type AppTextInputProps = TextInputProps & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
};

export function AppTextInput({
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  placeholderTextColor,
  multiline = false,
  numberOfLines,
  ...props
}: AppTextInputProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          minHeight: theme.scaleSpace(54),
          backgroundColor: theme.colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.scaleSpace(spacing.md),
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
        },
        iconWrap: {
          minWidth: theme.scaleSpace(20),
          alignItems: "center",
          justifyContent: "center",
        },
        input: {
          flex: 1,
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(14),
          fontFamily: "InterMedium",
          paddingVertical: theme.scaleSpace(14),
        },
        multilineInput: {
          minHeight: theme.scaleSpace(90),
          paddingTop: theme.scaleSpace(spacing.sm),
        },
      }),
    [theme],
  );
  const resolvedPlaceholderTextColor =
    placeholderTextColor ?? theme.colors.mutedForeground;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
      <TextInput
        {...props}
        placeholderTextColor={resolvedPlaceholderTextColor}
        multiline={multiline}
        numberOfLines={numberOfLines ?? (multiline ? 4 : 1)}
        style={[styles.input, multiline ? styles.multilineInput : null, style]}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {rightIcon ? <View style={styles.iconWrap}>{rightIcon}</View> : null}
    </View>
  );
}
