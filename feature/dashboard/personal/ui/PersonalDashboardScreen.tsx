import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  ReceiptText,
} from "lucide-react-native";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
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
  const netBalanceCard = viewModel.summaryCards[2];

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
            <View key={summaryCard.id} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{summaryCard.title}</Text>
              <Text style={[styles.summaryValue, { color: toneColor }]}>
                {summaryCard.value}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <ArrowDownLeft size={16} color={colors.success} />
          <Text style={styles.statValue}>NPR 5,600</Text>
          <Text style={styles.statLabel}>Today In</Text>
        </View>
        <View style={styles.statCard}>
          <ArrowUpRight size={16} color={colors.destructive} />
          <Text style={styles.statValue}>NPR 2,450</Text>
          <Text style={styles.statLabel}>Today Out</Text>
        </View>
        <View style={styles.statCard}>
          <AlertCircle size={16} color={colors.warning} />
          <Text style={styles.statValue}>{netBalanceCard?.value ?? "NPR 0"}</Text>
          <Text style={styles.statLabel}>Net</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionRow}>
        {viewModel.quickActions.map((quickAction) => {
          const icon =
            quickAction.id === "transactions" ? (
              <ArrowLeftRight size={20} color={colors.primary} />
            ) : quickAction.id === "emi" ? (
              <CreditCard size={20} color={colors.primary} />
            ) : quickAction.id === "reports" ? (
              <ReceiptText size={20} color={colors.primary} />
            ) : (
              <PiggyBank size={20} color={colors.primary} />
            );

          return (
            <View key={quickAction.id} style={styles.quickActionCard}>
              <View style={styles.quickActionIconWrap}>{icon}</View>
              <Text style={styles.quickActionLabel}>{quickAction.label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityContainer}>
        {viewModel.recentItems.map((recentItem) => (
          <View key={recentItem.id} style={styles.activityRow}>
            <View style={styles.activityAvatar}>
              <Text style={styles.activityAvatarText}>{recentItem.title[0]}</Text>
            </View>

            <View style={styles.activityBody}>
              <Text style={styles.activityTitle}>{recentItem.title}</Text>
              <Text style={styles.activitySubtitle}>{recentItem.subtitle}</Text>
            </View>

            <View style={styles.activityAmountWrap}>
              <Text
                style={[
                  styles.activityAmount,
                  recentItem.tone === "income"
                    ? styles.activityAmountIncome
                    : styles.activityAmountExpense,
                ]}
              >
                {recentItem.amount}
              </Text>
              <Text style={styles.activityDirectionLabel}>
                {recentItem.tone === "income" ? "Income" : "Expense"}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
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
    fontWeight: "800",
  },
  statRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  statValue: {
    marginTop: 4,
    color: colors.cardForeground,
    fontSize: 13,
    fontWeight: "800",
  },
  statLabel: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 10,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "800",
  },
  quickActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
    fontSize: 12,
    fontWeight: "700",
  },
  activityContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  activityAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  activityAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  activitySubtitle: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 11,
  },
  activityAmountWrap: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  activityAmountIncome: {
    color: colors.success,
  },
  activityAmountExpense: {
    color: colors.destructive,
  },
  activityDirectionLabel: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 10,
  },
});
