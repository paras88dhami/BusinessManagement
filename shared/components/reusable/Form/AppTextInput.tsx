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
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

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
  placeholderTextColor = colors.mutedForeground,
  multiline = false,
  numberOfLines,
  ...props
}: AppTextInputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
      <TextInput
        {...props}
        placeholderTextColor={placeholderTextColor}
        multiline={multiline}
        numberOfLines={numberOfLines ?? (multiline ? 4 : 1)}
        style={[styles.input, multiline ? styles.multilineInput : null, style]}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {rightIcon ? <View style={styles.iconWrap}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 54,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterMedium",
    paddingVertical: 14,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: spacing.sm,
  },
});
