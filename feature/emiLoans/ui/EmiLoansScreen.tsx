import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CalendarClock,
  CircleAlert,
  HandCoins,
  Plus,
  Wallet,
} from "lucide-react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { SearchInputRow } from "@/shared/components/reusable/Form/SearchInputRow";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { InlineSectionHeader } from "@/shared/components/reusable/ScreenLayouts/InlineSectionHeader";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";
import {
  EmiListFilter,
  EmiPlanListItemState,
} from "@/feature/emiLoans/types/emi.state.types";
import { EmiListViewModel } from "@/feature/emiLoans/viewModel/emiList.viewModel";
import { EmiPlanEditorViewModel } from "@/feature/emiLoans/viewModel/emiPlanEditor.viewModel";
import { EmiPlanDetailViewModel } from "@/feature/emiLoans/viewModel/emiPlanDetail.viewModel";
import { EmiPlanEditorModal } from "./components/EmiPlanEditorModal";
import { EmiPlanDetailModal } from "./components/EmiPlanDetailModal";

type EmiLoansScreenProps = {
  listViewModel: EmiListViewModel;
  editorViewModel: EmiPlanEditorViewModel;
  detailViewModel: EmiPlanDetailViewModel;
};

const parseProgressRatio = (progressLabel: string): number => {
  const match = progressLabel.match(/(\d+)\s*\/\s*(\d+)/);

  if (!match) {
    return 0;
  }

  const paid = Number(match[1]);
  const total = Number(match[2]);

  if (!Number.isFinite(paid) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (paid / total) * 100));
};

const normalizeSubtitle = (subtitle: string): string => {
  return subtitle
    .replace(/\s*\u2022\s*/g, " | ")
    .replace(/\s*\u00e2\u20ac\u00a2\s*/g, " | ");
};

const getNextDueLabel = (subtitle: string): string => {
  const marker = "Next ";
  const markerIndex = subtitle.lastIndexOf(marker);

  if (markerIndex < 0) {
    return subtitle;
  }

  return subtitle.slice(markerIndex + marker.length);
};

const isZeroLike = (value: string): boolean => {
  const numericValue = Number(value.replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return false;
  }

  return numericValue === 0;
};

const buildPlanIcon = (
  plan: EmiPlanListItemState,
  theme: ReturnType<typeof useAppTheme>,
) => {
  if (plan.tone === "collect") {
    return <HandCoins size={18} color={theme.colors.success} />;
  }

  return <Wallet size={18} color={theme.colors.primary} />;
};

export function EmiLoansScreen({
  listViewModel,
  editorViewModel,
  detailViewModel,
}: EmiLoansScreenProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const filterOptions =
    listViewModel.planMode === "business"
      ? [
          { label: "All", value: EmiListFilter.All },
          { label: "Collect", value: EmiListFilter.Collect },
          { label: "Pay", value: EmiListFilter.Pay },
          { label: "Overdue", value: EmiListFilter.Overdue },
          { label: "Closed", value: EmiListFilter.Closed },
        ]
      : [
          { label: "All", value: EmiListFilter.All },
          { label: "Active", value: EmiListFilter.Active },
          { label: "Due", value: EmiListFilter.Due },
          { label: "Overdue", value: EmiListFilter.Overdue },
          { label: "Closed", value: EmiListFilter.Closed },
        ];

  const summaryById = React.useMemo(
    () => new Map(listViewModel.summaryCards.map((summaryCard) => [summaryCard.id, summaryCard])),
    [listViewModel.summaryCards],
  );

  const dueSummary = summaryById.get("due-today");
  const overdueSummary = summaryById.get("overdue");

  const primaryLeftSummary =
    listViewModel.planMode === "business"
      ? summaryById.get("to-collect")
      : summaryById.get("remaining");

  const primaryRightSummary =
    listViewModel.planMode === "business"
      ? summaryById.get("to-pay")
      : summaryById.get("my-plans");

  const dueBannerLabel = dueSummary?.value ?? listViewModel.zeroAmountLabel;
  const shouldShowDueBanner = !isZeroLike(dueBannerLabel) || Boolean(overdueSummary);

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
              label={listViewModel.primaryActionLabel}
              variant="primary"
              size="lg"
              style={styles.primaryActionButton}
              leadingIcon={
                <Plus size={18} color={theme.colors.primaryForeground} />
              }
              onPress={listViewModel.onOpenCreate}
            />
          </BottomTabAwareFooter>
        }
      >
        {shouldShowDueBanner ? (
          <View style={styles.alertCard}>
            <CircleAlert size={20} color={theme.colors.destructive} />
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTitle}>Upcoming Dues</Text>
              <Text style={styles.alertSubtitle}>{dueBannerLabel} due soon</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              {primaryLeftSummary?.label ?? "Total Outstanding"}
            </Text>
            <Text style={styles.summaryValue}>
              {primaryLeftSummary?.value ?? listViewModel.zeroAmountLabel}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              {primaryRightSummary?.label ?? "Active Plans"}
            </Text>
            <Text style={styles.summaryValueAccent}>
              {primaryRightSummary?.value ?? "0"}
            </Text>
          </View>
        </View>

        <SearchInputRow
          value={listViewModel.searchQuery}
          onChangeText={listViewModel.onChangeSearchQuery}
          placeholder={
            listViewModel.planMode === "business"
              ? "Search plans or party name"
              : "Search plans"
          }
          inputStyle={styles.searchInput}
        />

        <FilterChipGroup
          options={filterOptions}
          selectedValue={listViewModel.selectedFilter}
          onSelect={listViewModel.onChangeFilter}
        />

        <InlineSectionHeader
          title="Active Plans"
          actionLabel="View More"
          onActionPress={() => {
            listViewModel.onChangeSearchQuery("");
            listViewModel.onChangeFilter(EmiListFilter.All);
          }}
        />

        {listViewModel.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : listViewModel.errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{listViewModel.errorMessage}</Text>
          </View>
        ) : listViewModel.planItems.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>{listViewModel.emptyStateMessage}</Text>
          </View>
        ) : (
          <View style={styles.planListWrap}>
            {listViewModel.planItems.map((planItem) => {
              const progress = parseProgressRatio(planItem.progressLabel);
              const normalizedSubtitle = normalizeSubtitle(planItem.subtitle);
              const nextDueLabel = getNextDueLabel(normalizedSubtitle);

              return (
                <Pressable
                  key={planItem.remoteId}
                  onPress={() => void listViewModel.onOpenDetail(planItem.remoteId)}
                  style={styles.planCard}
                >
                  <View style={styles.planTopRow}>
                    <View
                      style={[
                        styles.planIconWrap,
                        planItem.tone === "collect"
                          ? styles.collectIconWrap
                          : styles.payIconWrap,
                      ]}
                    >
                      {buildPlanIcon(planItem, theme)}
                    </View>

                    <View style={styles.planTextWrap}>
                      <Text style={styles.planTitle}>{planItem.title}</Text>
                      <Text style={styles.planSubtitle}>{normalizedSubtitle}</Text>
                    </View>

                    <View
                      style={[
                        styles.planStatusBadge,
                        planItem.isClosed
                          ? styles.planStatusClosed
                          : styles.planStatusActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.planStatusText,
                          planItem.isClosed
                            ? styles.planStatusTextClosed
                            : styles.planStatusTextActive,
                        ]}
                      >
                        {planItem.isClosed ? "CLOSED" : "ACTIVE"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressMetaRow}>
                    <Text style={styles.progressMeta}>{planItem.progressLabel}</Text>
                    <Text style={styles.progressMeta}>{planItem.amountLabel} left</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>

                  {!planItem.isClosed ? (
                    <View style={styles.nextDueRow}>
                      <View style={styles.nextDueTextWrap}>
                        <CalendarClock
                          size={12}
                          color={
                            theme.isDarkMode
                              ? theme.colors.accentForeground
                              : theme.colors.mutedForeground
                          }
                        />
                        <Text style={styles.nextDueLabel}>Next: {nextDueLabel}</Text>
                      </View>
                      <Text style={styles.nextDueAmount}>{planItem.amountLabel}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScreenContainer>

      <EmiPlanEditorModal viewModel={editorViewModel} />
      <EmiPlanDetailModal viewModel={detailViewModel} />
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => {
  const secondaryTextColor = theme.isDarkMode
    ? theme.colors.accentForeground
    : theme.colors.mutedForeground;

  return StyleSheet.create({
    content: {
      gap: theme.scaleSpace(spacing.sm),
    },
    primaryActionButton: {
      width: "100%",
    },
    alertCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.isDarkMode
        ? "rgba(255, 107, 107, 0.28)"
        : "rgba(228, 71, 71, 0.24)",
      backgroundColor: theme.isDarkMode
        ? "rgba(255, 107, 107, 0.12)"
        : "rgba(228, 71, 71, 0.1)",
      paddingHorizontal: theme.scaleSpace(spacing.md),
      paddingVertical: theme.scaleSpace(spacing.md),
      flexDirection: "row",
      alignItems: "center",
      gap: theme.scaleSpace(spacing.sm),
    },
    alertTextWrap: {
      flex: 1,
      gap: 2,
    },
    alertTitle: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(14),
      fontFamily: "InterBold",
    },
    alertSubtitle: {
      color: secondaryTextColor,
      fontSize: theme.scaleText(12),
      lineHeight: theme.scaleLineHeight(16),
    },
    summaryGrid: {
      flexDirection: "row",
      gap: theme.scaleSpace(spacing.sm),
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.scaleSpace(spacing.md),
      paddingVertical: theme.scaleSpace(spacing.md),
    },
    summaryLabel: {
      color: secondaryTextColor,
      fontSize: theme.scaleText(12),
      marginBottom: theme.scaleSpace(4),
    },
    summaryValue: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(19),
      fontFamily: "InterBold",
    },
    summaryValueAccent: {
      color: theme.colors.primary,
      fontSize: theme.scaleText(19),
      fontFamily: "InterBold",
    },
    searchInput: {
      color: theme.colors.foreground,
      fontSize: theme.scaleText(14),
      paddingVertical: theme.scaleSpace(12),
    },
    centerState: {
      paddingVertical: theme.scaleSpace(spacing.xxl),
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      color: theme.colors.destructive,
      fontSize: theme.scaleText(13),
      fontFamily: "InterMedium",
      textAlign: "center",
    },
    emptyText: {
      color: secondaryTextColor,
      fontSize: theme.scaleText(14),
      lineHeight: theme.scaleLineHeight(20),
      textAlign: "center",
    },
    planListWrap: {
      gap: theme.scaleSpace(spacing.sm),
    },
    planCard: {
      backgroundColor: theme.colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.scaleSpace(spacing.md),
      paddingVertical: theme.scaleSpace(spacing.md),
      gap: theme.scaleSpace(spacing.sm),
    },
    planTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.scaleSpace(spacing.sm),
    },
    planIconWrap: {
      width: theme.scaleSpace(40),
      height: theme.scaleSpace(40),
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    collectIconWrap: {
      backgroundColor: theme.colors.accent,
    },
    payIconWrap: {
      backgroundColor: theme.colors.secondary,
    },
    planTextWrap: {
      flex: 1,
      gap: 2,
    },
    planTitle: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(14),
      fontFamily: "InterBold",
    },
    planSubtitle: {
      color: secondaryTextColor,
      fontSize: theme.scaleText(12),
      lineHeight: theme.scaleLineHeight(17),
    },
    planStatusBadge: {
      paddingHorizontal: theme.scaleSpace(8),
      paddingVertical: theme.scaleSpace(4),
      borderRadius: radius.sm,
    },
    planStatusActive: {
      backgroundColor: theme.isDarkMode
        ? "rgba(47, 143, 91, 0.18)"
        : "rgba(31, 99, 64, 0.16)",
    },
    planStatusClosed: {
      backgroundColor: theme.isDarkMode
        ? "rgba(99, 211, 148, 0.18)"
        : "rgba(46, 139, 87, 0.16)",
    },
    planStatusText: {
      fontSize: theme.scaleText(10),
      fontFamily: "InterBold",
    },
    planStatusTextActive: {
      color: theme.colors.primary,
    },
    planStatusTextClosed: {
      color: theme.colors.success,
    },
    progressMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.scaleSpace(spacing.sm),
    },
    progressMeta: {
      color: secondaryTextColor,
      fontSize: theme.scaleText(11),
      lineHeight: theme.scaleLineHeight(15),
    },
    progressTrack: {
      height: theme.scaleSpace(8),
      borderRadius: radius.pill,
      backgroundColor: theme.colors.muted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
    },
    nextDueRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.scaleSpace(spacing.sm),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.scaleSpace(spacing.sm),
    },
    nextDueTextWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.scaleSpace(6),
    },
    nextDueLabel: {
      color: secondaryTextColor,
      fontSize: theme.scaleText(12),
      lineHeight: theme.scaleLineHeight(16),
    },
    nextDueAmount: {
      color: theme.colors.cardForeground,
      fontSize: theme.scaleText(13),
      fontFamily: "InterBold",
    },
  });
};
