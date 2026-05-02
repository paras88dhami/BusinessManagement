import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Card } from './Card';
import { spacing } from '../../theme/spacing';
import { AppThemeContextValue } from '../../theme/AppThemeProvider';
import { useThemedStyles } from '../../theme/useThemedStyles';


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
  const styles = useThemedStyles(createStyles);

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

const createStyles = (theme: AppThemeContextValue) =>
  StyleSheet.create({
    card: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.scaleSpace(16),
      minHeight: theme.scaleSpace(104),
    },
    cardDashboard: {
      minHeight: 0,
      justifyContent: "center",
      paddingVertical: theme.scaleSpace(spacing.sm),
      paddingHorizontal: theme.scaleSpace(4),
    },
    iconWrap: {
      marginBottom: theme.scaleSpace(6),
    },
    iconWrapDashboard: {
      marginBottom: theme.scaleSpace(4),
    },
    value: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(18),
      fontFamily: "InterBold",
      marginBottom: theme.scaleSpace(2),
    },
    valueDashboard: {
      marginBottom: 0,
      fontSize: theme.scaleText(13),
    },
    label: {
      color: theme.colors.mutedForeground,
      fontSize: theme.scaleText(11),
      textAlign: 'center',
    },
    labelDashboard: {
      marginTop: theme.scaleSpace(2),
      fontSize: theme.scaleText(10),
    },
  });

