import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { radius } from "../../theme/spacing";
import { useAppTheme } from "../../theme/AppThemeProvider";

type AppIconButtonSize = "sm" | "md";

type AppIconButtonProps = Omit<PressableProps, "style"> & {
  children: React.ReactNode;
  size?: AppIconButtonSize;
  style?: StyleProp<ViewStyle>;
};

export function AppIconButton({
  children,
  size = "sm",
  style,
  disabled,
  accessibilityRole,
  ...props
}: AppIconButtonProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        base: {
          borderRadius: radius.pill,
          backgroundColor: theme.colors.accent,
          alignItems: "center",
          justifyContent: "center",
        },
        sm: {
          width: theme.scaleSpace(30),
          height: theme.scaleSpace(30),
        },
        md: {
          width: theme.scaleSpace(34),
          height: theme.scaleSpace(34),
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

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole={accessibilityRole ?? "button"}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
