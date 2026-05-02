import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";
import { spacing } from "@/shared/components/theme/spacing";

type DashboardTabScaffoldProps = {
  children: React.ReactNode;
  footer: React.ReactNode | null;
  baseBottomPadding: number;
  contentContainerStyle: StyleProp<ViewStyle> | null;
  showDivider: boolean;
};

export function DashboardTabScaffold({
  children,
  footer,
  baseBottomPadding,
  contentContainerStyle,
  showDivider,
}: DashboardTabScaffoldProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <ScreenContainer
      showDivider={showDivider}
      footer={footer}
      baseBottomPadding={baseBottomPadding}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
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
  const styles = useThemedStyles(createStyles);

  return (
    <Card style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardDescription}>{description}</Text>
    </Card>
  );
}

const createStyles = (theme: {
  colors: {
    cardForeground: string;
    mutedForeground: string;
  };
  scaleLineHeight: (value: number) => number;
  scaleSpace: (value: number) => number;
  scaleText: (value: number) => number;
}) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.scaleSpace(spacing.lg),
    paddingTop: theme.scaleSpace(spacing.lg),
    gap: theme.scaleSpace(spacing.sm),
  },
  infoCard: {
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  infoCardTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(15),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(4),
  },
  infoCardDescription: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    lineHeight: theme.scaleLineHeight(19),
  },
});
