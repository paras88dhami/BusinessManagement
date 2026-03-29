import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Bell, Wallet } from "lucide-react-native";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { PersonalDashboardViewModel } from "../viewModel/personalDashboard.viewModel";

type PersonalDashboardScreenProps = {
  viewModel: PersonalDashboardViewModel;
};

export function PersonalDashboardScreen({
  viewModel,
}: PersonalDashboardScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>eL</Text>
            </View>
            <View>
              <Text style={styles.headerSubtitle}>{viewModel.greetingLabel}</Text>
              <Text style={styles.headerTitle}>{viewModel.workspaceLabel}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.iconButton}>
              <Bell size={20} color={colors.headerForeground} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryGrid}>
          {viewModel.summaryCards.map((summaryCard) => {
            const valueColor =
              summaryCard.tone === "income"
                ? colors.success
                : summaryCard.tone === "expense"
                  ? colors.destructive
                  : colors.cardForeground;

            return (
              <View key={summaryCard.id} style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{summaryCard.title}</Text>
                <Text style={[styles.summaryValue, { color: valueColor }]}>
                  {summaryCard.value}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionGrid}>
          {viewModel.quickActions.map((quickAction) => (
            <View key={quickAction.id} style={styles.quickActionCard}>
              <View style={styles.quickActionIconWrap}>
                <Wallet size={18} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{quickAction.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentContainer}>
          {viewModel.recentItems.map((recentItem) => (
            <View key={recentItem.id} style={styles.recentRow}>
              <View
                style={[
                  styles.recentIconWrap,
                  recentItem.tone === "income"
                    ? styles.recentIconIncome
                    : styles.recentIconExpense,
                ]}
              >
                {recentItem.tone === "income" ? (
                  <ArrowDownLeft size={16} color={colors.success} />
                ) : (
                  <ArrowUpRight size={16} color={colors.destructive} />
                )}
              </View>

              <View style={styles.recentBody}>
                <Text style={styles.recentTitle}>{recentItem.title}</Text>
                <Text style={styles.recentSubtitle}>{recentItem.subtitle}</Text>
              </View>

              <Text
                style={[
                  styles.recentAmount,
                  recentItem.tone === "income"
                    ? styles.recentAmountIncome
                    : styles.recentAmountExpense,
                ]}
              >
                {recentItem.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={viewModel.onSwitchAccount}
            accessibilityRole="button"
          >
            <ArrowLeftRight size={16} color={colors.foreground} />
            <Text style={styles.secondaryActionLabel}>Switch Account</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={viewModel.onLogout}
            accessibilityRole="button"
          >
            <Text style={styles.primaryActionLabel}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.header,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.headerForeground,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    marginBottom: 2,
  },
  headerTitle: {
    color: colors.headerForeground,
    fontSize: 19,
    fontWeight: "800",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerDivider: {
    height: 4,
    backgroundColor: colors.destructive,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  summaryGrid: {
    gap: spacing.sm,
  },
  summaryCard: {
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
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "800",
  },
  quickActionGrid: {
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
    width: 34,
    height: 34,
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
  recentContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  recentIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  recentIconIncome: {
    backgroundColor: "rgba(46,139,87,0.15)",
  },
  recentIconExpense: {
    backgroundColor: "rgba(228,71,71,0.15)",
  },
  recentBody: {
    flex: 1,
  },
  recentTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  recentSubtitle: {
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  recentAmountIncome: {
    color: colors.success,
  },
  recentAmountExpense: {
    color: colors.destructive,
  },
  actionRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  secondaryActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  secondaryActionLabel: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "700",
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
  },
  primaryActionLabel: {
    color: colors.primaryForeground,
    fontSize: 13,
    fontWeight: "700",
  },
});
