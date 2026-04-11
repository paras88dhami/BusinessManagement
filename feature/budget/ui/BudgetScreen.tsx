import { BudgetEditorModal } from "@/feature/budget/ui/components/BudgetEditorModal";
import { BudgetDetailModal } from "@/feature/budget/ui/components/BudgetDetailModal";
import {
  BudgetListFilter,
  BudgetViewModel,
} from "@/feature/budget/viewModel/budget.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { SearchInputRow } from "@/shared/components/reusable/Form/SearchInputRow";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { InlineSectionHeader } from "@/shared/components/reusable/ScreenLayouts/InlineSectionHeader";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { CalendarClock, CircleAlert, PiggyBank, Plus } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BudgetScreenProps = {
  viewModel: BudgetViewModel;
};

const FILTER_OPTIONS = [
  { label: "All", value: BudgetListFilter.All },
  { label: "This Month", value: BudgetListFilter.ThisMonth },
  { label: "Overspent", value: BudgetListFilter.Overspent },
] as const;

export function BudgetScreen({ viewModel }: BudgetScreenProps) {
  const summaryById = React.useMemo(
    () => new Map(viewModel.summaryCards.map((summaryCard) => [summaryCard.id, summaryCard])),
    [viewModel.summaryCards],
  );

  const plannedSummary = summaryById.get("planned");
  const spentSummary = summaryById.get("spent");
  const shouldShowAlertBanner = viewModel.summaryCards.some(
    (summaryCard) => summaryCard.id === "spent" && summaryCard.tone === "alert",
  );

  return (
    <>
      <ScreenContainer
        showDivider={false}
        padded={true}
        contentContainerStyle={styles.content}
        baseBottomPadding={140}
        footer={
          <BottomTabAwareFooter>
            <AppButton
              label="Create New Budget"
              variant="secondary"
              size="lg"
              style={styles.createBudgetButton}
              labelStyle={styles.createBudgetLabel}
              leadingIcon={<Plus size={18} color={colors.primary} />}
              onPress={viewModel.onOpenCreate}
              disabled={!viewModel.canCreate}
            />
          </BottomTabAwareFooter>
        }
      >
        {shouldShowAlertBanner ? (
          <View style={styles.alertCard}>
            <CircleAlert size={20} color={colors.destructive} />
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTitle}>Budget Alert</Text>
              <Text style={styles.alertSubtitle}>
                Spending is above plan for one or more categories this month.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              {plannedSummary?.label ?? "This Month Planned"}
            </Text>
            <Text style={styles.summaryValue}>
              {plannedSummary?.value ?? "--"}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              {spentSummary?.label ?? "Spent This Month"}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                spentSummary?.tone === "alert" ? styles.alertValue : null,
              ]}
            >
              {spentSummary?.value ?? "--"}
            </Text>
          </View>
        </View>

        <SearchInputRow
          value={viewModel.searchQuery}
          onChangeText={viewModel.onChangeSearchQuery}
          placeholder="Search budget by category or month"
          inputStyle={styles.searchInput}
        />

        <FilterChipGroup
          options={FILTER_OPTIONS}
          selectedValue={viewModel.selectedFilter}
          onSelect={viewModel.onChangeFilter}
        />

        <InlineSectionHeader
          title={`Budget Categories - ${viewModel.monthLabel}`}
          actionLabel="Reset"
          onActionPress={() => {
            viewModel.onChangeSearchQuery("");
            viewModel.onChangeFilter(BudgetListFilter.All);
          }}
        />

        {viewModel.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : viewModel.errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          </View>
        ) : viewModel.budgetItems.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>{viewModel.emptyStateMessage}</Text>
          </View>
        ) : (
          <View style={styles.planListWrap}>
            {viewModel.budgetItems.map((budgetItem) => (
              <Pressable
                key={budgetItem.remoteId}
                onPress={() => void viewModel.onOpenDetail(budgetItem.remoteId)}
                style={styles.planCard}
              >
                <View style={styles.planTopRow}>
                  <View style={styles.planIconWrap}>
                    <PiggyBank size={18} color={colors.primary} />
                  </View>

                  <View style={styles.planTextWrap}>
                    <Text style={styles.planTitle}>{budgetItem.title}</Text>
                    <Text style={styles.planSubtitle}>{budgetItem.subtitle}</Text>
                  </View>

                  <View
                    style={[
                      styles.planStatusBadge,
                      budgetItem.isOverspent
                        ? styles.planStatusAlert
                        : styles.planStatusActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.planStatusText,
                        budgetItem.isOverspent
                          ? styles.planStatusTextAlert
                          : styles.planStatusTextActive,
                      ]}
                    >
                      {budgetItem.statusLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressMetaRow}>
                  <Text style={styles.progressMeta}>
                    Spent: {budgetItem.spentAmountLabel}
                  </Text>
                  <Text style={styles.progressMeta}>
                    Budget: {budgetItem.plannedAmountLabel}
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      budgetItem.isOverspent ? styles.progressFillAlert : null,
                      { width: `${budgetItem.progressPercent}%` },
                    ]}
                  />
                </View>

                <View style={styles.nextDueRow}>
                  <View style={styles.nextDueTextWrap}>
                    <CalendarClock size={12} color={colors.mutedForeground} />
                    <Text style={styles.nextDueLabel}>{budgetItem.monthLabel}</Text>
                  </View>
                  <Text
                    style={[
                      styles.nextDueAmount,
                      budgetItem.isOverspent ? styles.alertValue : styles.leftValue,
                    ]}
                  >
                    {budgetItem.isOverspent ? "Over: " : "Left: "}
                    {budgetItem.remainingAmountLabel}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScreenContainer>

      <BudgetEditorModal viewModel={viewModel} />
      <BudgetDetailModal viewModel={viewModel} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  createBudgetButton: {
    width: "100%",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(31, 99, 64, 0.35)",
    backgroundColor: colors.background,
  },
  createBudgetLabel: {
    color: colors.primary,
  },
  alertCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#F1B8B8",
    backgroundColor: "#FFF2F2",
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  alertTextWrap: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    color: colors.cardForeground,
    fontSize: 15,
    fontFamily: "InterBold",
  },
  alertSubtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 6,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.cardForeground,
    fontSize: 20,
    fontFamily: "InterBold",
  },
  alertValue: {
    color: colors.destructive,
  },
  leftValue: {
    color: colors.success,
  },
  searchInput: {
    minHeight: 52,
  },
  centerState: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: colors.destructive,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "InterSemiBold",
  },
  emptyText: {
    color: colors.mutedForeground,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "InterMedium",
  },
  planListWrap: {
    gap: spacing.sm,
  },
  planCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#C9E1D3",
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  planIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  planTextWrap: {
    flex: 1,
    gap: 2,
  },
  planTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontFamily: "InterBold",
  },
  planSubtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  planStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  planStatusActive: {
    backgroundColor: "#E7F5ED",
  },
  planStatusAlert: {
    backgroundColor: "#FBE4E4",
  },
  planStatusText: {
    fontSize: 11,
    fontFamily: "InterBold",
  },
  planStatusTextActive: {
    color: colors.success,
  },
  planStatusTextAlert: {
    color: colors.destructive,
  },
  progressMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  progressMeta: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  progressFillAlert: {
    backgroundColor: colors.destructive,
  },
  nextDueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  nextDueTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nextDueLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  nextDueAmount: {
    fontSize: 16,
    fontFamily: "InterBold",
  },
});

