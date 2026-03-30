import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
  DashboardTabItems,
  DashboardTabValue,
} from "../types/dashboardNavigation.types";

type DashboardTabScaffoldProps = {
  title: string;
  activeTab: DashboardTabValue;
  tabItems: DashboardTabItems;
  onTabPress: (tab: DashboardTabValue) => void;
  children: React.ReactNode;
};

export function DashboardTabScaffold({
  title: _title,
  activeTab: _activeTab,
  tabItems: _tabItems,
  onTabPress: _onTabPress,
  children,
}: DashboardTabScaffoldProps) {
  return (
    <ScreenContainer
      showDivider={false}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScreenContainer>
  );
}

type DashboardInfoCardProps = {
  title: string;
  description: string;
};

export function DashboardInfoCard({
  title,
  description,
}: DashboardInfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  infoCardTitle: {
    color: colors.cardForeground,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoCardDescription: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 19,
  },
});
