import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Card } from './Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';


interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  valueColor?: string;
  size?: "default" | "dashboard";
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  icon,
  value,
  label,
  valueColor,
  size = "default",
  style,
}: StatCardProps) {
  const isDashboardSize = size === "dashboard";

  return (
    <Card
      style={[
        styles.card,
        isDashboardSize ? styles.cardDashboard : null,
        style,
      ]}
    >
      <View style={[styles.iconWrap, isDashboardSize ? styles.iconWrapDashboard : null]}>
        {icon}
      </View>
      <Text
        style={[
          styles.value,
          isDashboardSize ? styles.valueDashboard : null,
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.label, isDashboardSize ? styles.labelDashboard : null]}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 104,
  },
  cardDashboard: {
    minHeight: 0,
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  iconWrap: {
    marginBottom: 6,
  },
  iconWrapDashboard: {
    marginBottom: 4,
  },
  value: {
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
    marginBottom: 2,
  },
  valueDashboard: {
    marginBottom: 0,
    fontSize: 13,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 11,
    textAlign: 'center',
  },
  labelDashboard: {
    marginTop: 2,
    fontSize: 10,
  },
});

