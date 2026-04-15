import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

type AppButtonVariant = "primary" | "secondary" | "accent";
type AppButtonSize = "sm" | "md" | "lg";

type AppButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leadingIcon?: React.ReactNode;
  isLoading?: boolean;
};

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.accent,
  },
});

const variantLabelStyles = StyleSheet.create({
  primary: {
    color: colors.primaryForeground,
  },
  secondary: {
    color: colors.foreground,
  },
  accent: {
    color: colors.primary,
  },
});

const resolveSpinnerColor = (variant: AppButtonVariant): string => {
  if (variant === "primary") {
    return colors.primaryForeground;
  }

  if (variant === "accent") {
    return colors.primary;
  }

  return colors.foreground;
};

export function AppButton({
  label,
  variant = "primary",
  size = "md",
  style,
  labelStyle,
  leadingIcon,
  disabled,
  isLoading = false,
  accessibilityRole,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        variantStyles[variant],
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      {isLoading ? (
        <View style={styles.iconWrap}>
          <ActivityIndicator
            size="small"
            color={resolveSpinnerColor(variant)}
          />
        </View>
      ) : leadingIcon ? (
        <View style={styles.iconWrap}>{leadingIcon}</View>
      ) : null}

      <Text style={[styles.label, variantLabelStyles[variant], labelStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  sm: {
    minHeight: 34,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  md: {
    minHeight: 44,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  lg: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 16,
  },
  label: {
    fontFamily: "InterBold",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.88,
  },
});
