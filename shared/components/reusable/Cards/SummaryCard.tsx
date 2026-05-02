import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { AppThemeContextValue } from "@/shared/components/theme/AppThemeProvider";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

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
  const styles = useThemedStyles(createStyles);

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

const createStyles = (theme: AppThemeContextValue) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minHeight: theme.scaleSpace(126),
    },
    cardDashboard: {
      minHeight: 0,
      paddingHorizontal: theme.scaleSpace(spacing.md),
      paddingVertical: theme.scaleSpace(spacing.sm + 2),
    },
    iconCircle: {
      width: theme.scaleSpace(34),
      height: theme.scaleSpace(34),
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.scaleSpace(14),
    },
    iconCircleDashboard: {
      marginBottom: theme.scaleSpace(4),
    },
    title: {
      color: theme.colors.mutedForeground,
      fontSize: theme.scaleText(12),
      marginBottom: theme.scaleSpace(4),
    },
    titleDashboard: {
      marginBottom: theme.scaleSpace(2),
      fontFamily: "InterMedium",
    },
    value: {
      fontSize: theme.scaleText(20),
      fontFamily: "InterBold",
    },
  });

