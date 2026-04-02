import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueColor: string;
  iconBg: string;
  size?: "default" | "dashboard";
  style?: StyleProp<ViewStyle>;
}

export function SummaryCard({
  icon,
  title,
  value,
  valueColor,
  iconBg,
  size = "default",
  style,
}: SummaryCardProps) {
  const isDashboardSize = size === "dashboard";

  return (
    <Card
      style={[
        styles.card,
        isDashboardSize ? styles.cardDashboard : null,
        style,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          isDashboardSize ? styles.iconCircleDashboard : null,
          { backgroundColor: iconBg },
        ]}
      >
        {icon}
      </View>
      <Text style={[styles.title, isDashboardSize ? styles.titleDashboard : null]}>
        {title}
      </Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 126,
  },
  cardDashboard: {
    minHeight: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconCircleDashboard: {
    marginBottom: 4,
  },
  title: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  titleDashboard: {
    marginBottom: 2,
    fontFamily: "InterMedium",
  },
  value: {
    fontSize: 20,
    fontFamily: "InterBold",
  },
});

