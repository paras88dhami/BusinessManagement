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
import { radius, spacing } from "../../theme/spacing";
import { useAppTheme } from "../../theme/AppThemeProvider";

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

const resolveSpinnerColor = (
  variant: AppButtonVariant,
  foregroundColors: {
    primary: string;
    secondary: string;
    accent: string;
  },
): string => {
  if (variant === "primary") {
    return foregroundColors.primary;
  }

  if (variant === "accent") {
    return foregroundColors.accent;
  }

  return foregroundColors.secondary;
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
  const theme = useAppTheme();
  const isDisabled = disabled || isLoading;
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        base: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.scaleSpace(spacing.xs),
        },
        sm: {
          minHeight: theme.scaleSpace(34),
          borderRadius: radius.md,
          paddingHorizontal: theme.scaleSpace(spacing.sm),
        },
        md: {
          minHeight: theme.scaleSpace(44),
          borderRadius: radius.md,
          paddingHorizontal: theme.scaleSpace(spacing.md),
        },
        lg: {
          minHeight: theme.scaleSpace(52),
          borderRadius: radius.lg,
          paddingHorizontal: theme.scaleSpace(spacing.md),
        },
        iconWrap: {
          alignItems: "center",
          justifyContent: "center",
          minWidth: theme.scaleSpace(16),
        },
        label: {
          fontFamily: "InterBold",
          fontSize: theme.scaleText(14),
        },
        disabled: {
          opacity: 0.6,
        },
        pressed: {
          opacity: 0.88,
        },
      }),
    [theme],
  );
  const variantStyles = React.useMemo(
    () =>
      StyleSheet.create({
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        accent: {
          backgroundColor: theme.colors.accent,
        },
      }),
    [theme],
  );
  const variantLabelStyles = React.useMemo(
    () =>
      StyleSheet.create({
        primary: {
          color: theme.colors.primaryForeground,
        },
        secondary: {
          color: theme.colors.foreground,
        },
        accent: {
          color: theme.colors.primary,
        },
      }),
    [theme],
  );
  const spinnerColors = React.useMemo(
    () => ({
      primary: theme.colors.primaryForeground,
      secondary: theme.colors.foreground,
      accent: theme.colors.primary,
    }),
    [theme.colors.foreground, theme.colors.primary, theme.colors.primaryForeground],
  );

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
            color={resolveSpinnerColor(variant, spinnerColors)}
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
