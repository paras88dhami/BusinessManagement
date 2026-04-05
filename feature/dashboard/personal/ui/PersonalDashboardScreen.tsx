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
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { PersonalDashboardViewModel } from "../viewModel/personalDashboard.viewModel";

type PersonalDashboardScreenProps = {
  viewModel: PersonalDashboardViewModel;
};

export function PersonalDashboardScreen({
  viewModel,
}: PersonalDashboardScreenProps) {
  const primarySummaryCards = viewModel.summaryCards.slice(0, 2);

  return (
    <ScreenContainer
      showDivider={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.summaryRow}>
        {primarySummaryCards.map((summaryCard) => {
          const toneColor =
            summaryCard.tone === "income" ? colors.success : colors.destructive;

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
          <ArrowDownLeft size={16} color={colors.success} />
          <Text style={styles.statValue}>{viewModel.todayInValue}</Text>
          <Text style={styles.statLabel}>Today In</Text>
        </Card>
        <Card style={styles.statCard}>
          <ArrowUpRight size={16} color={colors.destructive} />
          <Text style={styles.statValue}>{viewModel.todayOutValue}</Text>
          <Text style={styles.statLabel}>Today Out</Text>
        </Card>
        <Card style={styles.statCard}>
          <AlertCircle size={16} color={colors.warning} />
          <Text style={styles.statValue}>{viewModel.netValue}</Text>
          <Text style={styles.statLabel}>Net</Text>
        </Card>
      </View>

      {viewModel.isLoading ? (
        <ActivityIndicator style={styles.infoBlock} color={colors.primary} />
      ) : null}
      {viewModel.errorMessage ? (
        <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionRow}>
        {viewModel.quickActions.map((quickAction) => {
          const icon =
            quickAction.id === "transactions" ? (
              <ArrowLeftRight size={20} color={colors.primary} />
            ) : quickAction.id === "emi" ? (
              <CreditCard size={20} color={colors.primary} />
            ) : quickAction.id === "notes" ? (
              <StickyNote size={20} color={colors.primary} />
            ) : (
              <PiggyBank size={20} color={colors.primary} />
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

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "InterBold",
  },
  statRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  statValue: {
    marginTop: 4,
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterBold",
  },
  statLabel: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 10,
  },
  infoBlock: {
    marginTop: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.destructive,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.foreground,
    fontSize: 17,
    fontFamily: "InterBold",
  },
  quickActionRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: spacing.xs,
    alignItems: "stretch",
  },
  quickActionCard: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    color: colors.cardForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textAlign: "center",
  },
  chartCard: {
    paddingVertical: spacing.md,
  },
  chartTitle: {
    color: colors.cardForeground,
    fontSize: 17,
    fontFamily: "InterBold",
    marginBottom: 4,
  },
  chartSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
});

