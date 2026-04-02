import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
});
