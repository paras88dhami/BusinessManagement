import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { radius } from "../../theme/spacing";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardPressableProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.scaleSpace(14),
          shadowColor: theme.isDarkMode ? "#000000" : "#000000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: theme.isDarkMode ? 0.28 : 0.1,
          shadowRadius: 2,
          elevation: theme.isDarkMode ? 1 : 2,
        },
        cardSurface: {
          borderRadius: radius.md,
        },
      }),
    [theme],
  );

  return <View style={[styles.card, styles.cardSurface, style]}>{children}</View>;
}

export function CardPressable({
  children,
  style,
  disabled,
  accessibilityRole,
  ...props
}: CardPressableProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.scaleSpace(14),
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: theme.isDarkMode ? 0.28 : 0.1,
          shadowRadius: 2,
          elevation: theme.isDarkMode ? 1 : 2,
        },
        cardSurface: {
          borderRadius: radius.md,
        },
        pressed: {
          opacity: 0.88,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole={accessibilityRole ?? "button"}
      style={({ pressed }) => [
        styles.card,
        styles.cardSurface,
        style,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      {children}
    </Pressable>
  );
}
