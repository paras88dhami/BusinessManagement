import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  StickyNote,
} from "lucide-react-native";
import { Card, CardPressable } from "@/shared/components/reusable/Cards/Card";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { GroupedBarChart } from "@/shared/components/reusable/Charts/FinancialCharts";
import { TransactionTable } from "@/shared/components/reusable/Tables/TransactionTable";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";
import { PersonalDashboardViewModel } from "../viewModel/personalDashboard.viewModel";

type PersonalDashboardScreenProps = {
  viewModel: PersonalDashboardViewModel;
};

export function PersonalDashboardScreen({
  viewModel,
}: PersonalDashboardScreenProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const primarySummaryCards = viewModel.summaryCards.slice(0, 2);

  return (
    <ScreenContainer
      showDivider={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.summaryRow}>
        {primarySummaryCards.map((summaryCard) => {
          const toneColor =
            summaryCard.tone === "income"
              ? theme.colors.success
              : theme.colors.destructive;

          return (
            <Card key={summaryCard.id} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{summaryCard.title}</Text>
              <Text style={[styles.summaryValue, { color: toneColor }]}>
                {summaryCard.value}
              </Text>
            </Card>
          );
        })}
      </View>

      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <ArrowDownLeft size={16} color={theme.colors.success} />
          <Text style={styles.statValue}>{viewModel.todayInValue}</Text>
          <Text style={styles.statLabel}>Today In</Text>
        </Card>
        <Card style={styles.statCard}>
          <ArrowUpRight size={16} color={theme.colors.destructive} />
          <Text style={styles.statValue}>{viewModel.todayOutValue}</Text>
          <Text style={styles.statLabel}>Today Out</Text>
        </Card>
        <Card style={styles.statCard}>
          <AlertCircle size={16} color={theme.colors.warning} />
          <Text style={styles.statValue}>{viewModel.netValue}</Text>
          <Text style={styles.statLabel}>Net</Text>
        </Card>
      </View>

      {viewModel.isLoading ? (
        <ActivityIndicator style={styles.infoBlock} color={theme.colors.primary} />
      ) : null}
      {viewModel.errorMessage ? (
        <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionRow}>
        {viewModel.quickActions.map((quickAction) => {
          const icon =
            quickAction.id === "transactions" ? (
              <ArrowLeftRight size={20} color={theme.colors.primary} />
            ) : quickAction.id === "emi" ? (
              <CreditCard size={20} color={theme.colors.primary} />
            ) : quickAction.id === "notes" ? (
              <StickyNote size={20} color={theme.colors.primary} />
            ) : (
              <PiggyBank size={20} color={theme.colors.primary} />
            );

          return (
            <CardPressable
              key={quickAction.id}
              style={styles.quickActionCard}
              onPress={() => viewModel.onQuickActionPress(quickAction.id)}
            >
              <View style={styles.quickActionIconWrap}>{icon}</View>
              <Text
                style={styles.quickActionLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {quickAction.label}
              </Text>
            </CardPressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Income & Expense</Text>
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Last 7 Days</Text>
        <Text style={styles.chartSubtitle}>Daily income vs expense</Text>
        <GroupedBarChart data={viewModel.incomeExpenseSeries} />
      </Card>

      <Text style={styles.sectionTitle}>Transactions</Text>
      <TransactionTable
        rows={viewModel.transactionRows}
        emptyStateText="No recent transactions available."
      />
    </ScreenContainer>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.scaleSpace(spacing.lg),
    paddingTop: theme.scaleSpace(spacing.lg),
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.sm),
  },
  summaryCard: {
    flex: 1,
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  summaryLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    marginBottom: theme.scaleSpace(4),
  },
  summaryValue: {
    fontSize: theme.scaleText(20),
    fontFamily: "InterBold",
  },
  statRow: {
    marginTop: theme.scaleSpace(spacing.sm),
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.xs),
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(4),
  },
  statValue: {
    marginTop: theme.scaleSpace(4),
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  statLabel: {
    marginTop: theme.scaleSpace(2),
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(10),
  },
  infoBlock: {
    marginTop: theme.scaleSpace(spacing.sm),
  },
  errorText: {
    marginTop: theme.scaleSpace(spacing.xs),
    color: theme.colors.destructive,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  sectionTitle: {
    marginTop: theme.scaleSpace(spacing.lg),
    marginBottom: theme.scaleSpace(spacing.sm),
    color: theme.colors.foreground,
    fontSize: theme.scaleText(17),
    fontFamily: "InterBold",
  },
  quickActionRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: theme.scaleSpace(spacing.xs),
    alignItems: "stretch",
  },
  quickActionCard: {
    flex: 1,
    minWidth: 0,
    paddingVertical: theme.scaleSpace(spacing.sm + 2),
    paddingHorizontal: theme.scaleSpace(4),
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIconWrap: {
    width: theme.scaleSpace(36),
    height: theme.scaleSpace(36),
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
    marginBottom: theme.scaleSpace(spacing.xs),
  },
  quickActionLabel: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(11),
    fontFamily: "InterBold",
    textAlign: "center",
  },
  chartCard: {
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  chartTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(17),
    fontFamily: "InterBold",
    marginBottom: theme.scaleSpace(4),
  },
  chartSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    marginBottom: theme.scaleSpace(spacing.sm),
  },
});

