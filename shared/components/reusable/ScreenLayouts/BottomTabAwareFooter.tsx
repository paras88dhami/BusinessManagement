import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@/shared/components/theme/spacing";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { getBottomTabBarClearance } from "./BottomTabBar";

type BottomTabAwareFooterProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  reserveTabBarClearance?: boolean;
};

export function BottomTabAwareFooter({
  children,
  style,
  reserveTabBarClearance = true,
}: BottomTabAwareFooterProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: theme.scaleSpace(spacing.lg),
          paddingTop: theme.scaleSpace(spacing.md),
          backgroundColor: theme.colors.background,
        },
      }),
    [theme],
  );
  const resolvedBottomPadding = reserveTabBarClearance
    ? getBottomTabBarClearance(insets.bottom)
    : Math.max(insets.bottom, spacing.sm);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: resolvedBottomPadding },
        style,
      ]}
    >
      {children}
    </View>
  );
}
