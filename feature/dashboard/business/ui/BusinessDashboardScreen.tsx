import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Package,
  ReceiptText,
  Users,
} from "lucide-react-native";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { BusinessDashboardViewModel } from "../viewModel/businessDashboard.viewModel";

type BusinessDashboardScreenProps = {
  viewModel: BusinessDashboardViewModel;
};

export function BusinessDashboardScreen({
  viewModel,
}: BusinessDashboardScreenProps) {
  return (
    <ScreenContainer
      showDivider={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.summaryRow}>
        {viewModel.summaryCards.map((summaryCard) => {
          const toneColor =
            summaryCard.tone === "receive" ? colors.success : colors.destructive;

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
          <Text style={styles.statValue}>NPR 12,500</Text>
          <Text style={styles.statLabel}>Today In</Text>
        </View>
        <View style={styles.statCard}>
          <ArrowUpRight size={16} color={colors.destructive} />
          <Text style={styles.statValue}>NPR 3,200</Text>
          <Text style={styles.statLabel}>Today Out</Text>
        </View>
        <View style={styles.statCard}>
          <AlertCircle size={16} color={colors.warning} />
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionRow}>
        {viewModel.quickActions.map((quickAction) => {
          const icon =
            quickAction.id === "products" ? (
              <Package size={20} color={colors.primary} />
            ) : quickAction.id === "billing" ? (
              <ReceiptText size={20} color={colors.primary} />
            ) : quickAction.id === "contacts" ? (
              <Users size={20} color={colors.primary} />
            ) : (
              <ArrowLeftRight size={20} color={colors.primary} />
            );

          return (
            <View key={quickAction.id} style={styles.quickActionCard}>
              <View style={styles.quickActionIconWrap}>{icon}</View>
              <Text style={styles.quickActionLabel}>{quickAction.label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Due Today</Text>
      <View style={styles.dueListContainer}>
        {viewModel.dueItems.map((dueItem) => (
          <View key={dueItem.id} style={styles.dueRow}>
            <View style={styles.dueAvatar}>
              <Text style={styles.dueAvatarText}>{dueItem.name[0]}</Text>
            </View>

            <View style={styles.dueBody}>
              <Text style={styles.dueName}>{dueItem.name}</Text>
              <Text style={styles.dueSubtitle}>{dueItem.subtitle}</Text>
            </View>

            <View style={styles.dueAmountWrap}>
              <Text
                style={[
                  styles.dueAmount,
                  dueItem.direction === "receive"
                    ? styles.dueAmountReceive
                    : styles.dueAmountPay,
                ]}
              >
                {dueItem.amount}
              </Text>
              <Text style={styles.dueDirectionLabel}>
                {dueItem.direction === "receive" ? "To Receive" : "To Pay"}
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
  dueListContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  dueAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  dueAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  dueBody: {
    flex: 1,
  },
  dueName: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  dueSubtitle: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 11,
  },
  dueAmountWrap: {
    alignItems: "flex-end",
  },
  dueAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  dueAmountReceive: {
    color: colors.success,
  },
  dueAmountPay: {
    color: colors.destructive,
  },
  dueDirectionLabel: {
    marginTop: 2,
    color: colors.mutedForeground,
    fontSize: 10,
  },
});
