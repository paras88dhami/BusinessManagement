import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Clock3,
  Plus,
  RotateCcw,
  User,
} from "lucide-react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { SummaryCard } from "@/shared/components/reusable/Cards/SummaryCard";
import { DropdownButton } from "@/shared/components/reusable/DropDown/DropdownButton";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { SearchInputRow } from "@/shared/components/reusable/Form/SearchInputRow";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { InlineSectionHeader } from "@/shared/components/reusable/ScreenLayouts/InlineSectionHeader";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { LedgerEntryType } from "@/feature/ledger/types/ledger.entity.types";
import { LedgerListFilter } from "@/feature/ledger/types/ledger.state.types";
import { LedgerListViewModel } from "@/feature/ledger/viewModel/ledgerList.viewModel";
import { LedgerEditorViewModel } from "@/feature/ledger/viewModel/ledgerEditor.viewModel";
import { LedgerDeleteViewModel } from "@/feature/ledger/viewModel/ledgerDelete.viewModel";
import { LedgerPartyDetailViewModel } from "@/feature/ledger/viewModel/ledgerPartyDetail.viewModel";
import { LedgerDeleteModal } from "./components/LedgerDeleteModal";
import { LedgerEntryEditorModal } from "./components/LedgerEntryEditorModal";
import { LedgerPartyDetailModal } from "./components/LedgerPartyDetailModal";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

type LedgerScreenProps = {
  listViewModel: LedgerListViewModel;
  editorViewModel: LedgerEditorViewModel;
  deleteViewModel: LedgerDeleteViewModel;
  partyDetailViewModel: LedgerPartyDetailViewModel;
};

const FILTER_OPTIONS = [
  { value: LedgerListFilter.All, label: "All" },
  { value: LedgerListFilter.ToReceive, label: "To Receive" },
  { value: LedgerListFilter.ToPay, label: "To Pay" },
  { value: LedgerListFilter.DueToday, label: "Due Today" },
  { value: LedgerListFilter.Overdue, label: "Overdue" },
] as const;

export function LedgerScreen({
  listViewModel,
  editorViewModel,
  deleteViewModel,
  partyDetailViewModel,
}: LedgerScreenProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const primarySummaryCards = listViewModel.summaryCards.slice(0, 2);
  const secondarySummaryCards = listViewModel.summaryCards.slice(2, 4);

  const miniStats = [
    ...secondarySummaryCards,
    {
      id: "parties",
      label: "Parties",
      value: `${listViewModel.partyItems.length}`,
      tone: "neutral" as const,
    },
  ];

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
              label="Quick Ledger Entry"
              variant="primary"
              size="lg"
              style={styles.primaryActionButton}
              leadingIcon={
                <Plus size={18} color={theme.colors.primaryForeground} />
              }
              onPress={() => listViewModel.onOpenCreate(LedgerEntryType.Sale)}
            />
          </BottomTabAwareFooter>
        }
      >
        <View style={styles.summaryGrid}>
          {primarySummaryCards.map((summaryCard) => {
            const isReceive = summaryCard.tone === "receive";

            return (
              <SummaryCard
                key={summaryCard.id}
                size="dashboard"
                icon={
                  isReceive ? (
                    <ArrowDownCircle size={16} color={theme.colors.success} />
                  ) : (
                    <ArrowUpCircle
                      size={16}
                      color={theme.colors.destructive}
                    />
                  )
                }
                title={summaryCard.label}
                value={summaryCard.value}
                valueColor={
                  isReceive ? theme.colors.success : theme.colors.destructive
                }
                iconBg={
                  isReceive
                    ? "rgba(46, 139, 87, 0.14)"
                    : "rgba(228, 71, 71, 0.14)"
                }
              />
            );
          })}
        </View>

        <View style={styles.miniStatGrid}>
          {miniStats.map((miniStat) => {
            const isOverdue = miniStat.id === "overdue";
            const isDueToday = miniStat.id === "due-today";

            const icon = isOverdue ? (
              <ArrowUpCircle size={16} color={theme.colors.destructive} />
            ) : isDueToday ? (
              <CalendarClock size={16} color={theme.colors.warning} />
            ) : (
              <RotateCcw size={16} color={theme.colors.success} />
            );

            return (
              <StatCard
                key={miniStat.id}
                size="dashboard"
                icon={icon}
                value={miniStat.value}
                label={miniStat.label}
              />
            );
          })}
        </View>

        {listViewModel.hasOverdueAging ? (
          <View style={styles.agingSection}>
            <DropdownButton
              label="Receivable Aging"
              subtitle={
                listViewModel.isReceivableAgingExpanded
                  ? "Hide receivable aging buckets"
                  : "View receivable aging buckets"
              }
              expanded={listViewModel.isReceivableAgingExpanded}
              onPress={listViewModel.onToggleReceivableAging}
              leadingIcon={<CalendarClock size={16} color={theme.colors.primary} />}
            />

            {listViewModel.isReceivableAgingExpanded ? (
              <View style={styles.agingGrid}>
                {listViewModel.agingBuckets.map((bucket) => (
                  <View
                    key={bucket.id}
                    style={[
                      styles.agingCard,
                      bucket.tone === "destructive"
                        ? styles.agingCardCritical
                        : bucket.tone === "warning"
                          ? styles.agingCardWarning
                          : null,
                    ]}
                  >
                    <Text style={styles.agingLabel}>{bucket.label}</Text>
                    <Text style={styles.agingAmount}>{bucket.amountLabel}</Text>
                    <Text style={styles.agingCount}>{bucket.countLabel}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <InlineSectionHeader title="Collection Queue" />
        {listViewModel.collectionQueue.length === 0 ? (
          <View style={styles.queueEmptyState}>
            <Clock3 size={16} color={theme.colors.mutedForeground} />
            <Text style={styles.queueEmptyText}>No overdue collection action right now.</Text>
          </View>
        ) : (
          <View style={styles.collectionQueueContainer}>
            {listViewModel.collectionQueue.map((queueItem, index) => (
              <View
                key={queueItem.id}
                style={[
                  styles.collectionQueueRow,
                  index < listViewModel.collectionQueue.length - 1
                    ? styles.partyRowDivider
                    : null,
                ]}
              >
                <Pressable
                  style={styles.collectionQueueInfo}
                  onPress={() =>
                    void listViewModel.onOpenPartyDetail(
                      queueItem.partyId,
                      queueItem.partyName,
                    )
                  }
                >
                  <View style={styles.queueTitleRow}>
                    <Text style={styles.collectionQueuePartyName}>
                      {queueItem.partyName}
                    </Text>
                    {queueItem.priority === "critical" ? (
                      <AlertTriangle
                        size={14}
                        color={theme.colors.destructive}
                      />
                    ) : null}
                  </View>
                  <Text style={styles.collectionQueueMeta}>{queueItem.metaLabel}</Text>
                  <Text style={styles.collectionQueueAmount}>{queueItem.amountLabel}</Text>
                </Pressable>

                <AppButton
                  label="Collect"
                  variant="secondary"
                  size="sm"
                  onPress={() => listViewModel.onQuickCollectFromQueue(queueItem.partyName)}
                />
              </View>
            ))}
          </View>
        )}

        <SearchInputRow
          value={listViewModel.searchQuery}
          onChangeText={listViewModel.onChangeSearchQuery}
          placeholder="Search party name"
          inputStyle={styles.searchInput}
        />

        <FilterChipGroup
          options={FILTER_OPTIONS}
          selectedValue={listViewModel.selectedFilter}
          onSelect={listViewModel.onChangeFilter}
        />

        <InlineSectionHeader
          title="Parties"
          actionLabel="View More"
          onActionPress={() => {
            listViewModel.onChangeSearchQuery("");
            listViewModel.onChangeFilter(LedgerListFilter.All);
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
        ) : listViewModel.partyItems.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>{listViewModel.emptyStateMessage}</Text>
          </View>
        ) : (
          <View style={styles.partyListContainer}>
            {listViewModel.partyItems.map((partyItem, index) => (
              <Pressable
                key={partyItem.id}
                style={[
                  styles.partyRow,
                  index < listViewModel.partyItems.length - 1
                    ? styles.partyRowDivider
                    : null,
                ]}
                onPress={() =>
                  void listViewModel.onOpenPartyDetail(
                    partyItem.id,
                    partyItem.partyName,
                  )
                }
              >
                <View style={styles.partyAvatar}>
                  <User size={18} color={theme.colors.primary} />
                </View>

                <View style={styles.partyTextWrap}>
                  <Text style={styles.partyName}>{partyItem.partyName}</Text>
                  <Text style={styles.partySubtitle}>{partyItem.subtitle}</Text>
                </View>

                <View style={styles.partyAmountWrap}>
                  <Text
                    style={[
                      styles.partyAmount,
                      partyItem.tone === "receive"
                        ? styles.receiveValue
                        : styles.payValue,
                    ]}
                  >
                    {partyItem.amountLabel}
                  </Text>
                  <Text style={styles.partyToneLabel}>
                    {partyItem.tone === "receive" ? "To Receive" : "To Pay"}
                  </Text>
                  {partyItem.badgeLabel ? (
                    <View style={styles.badgeWrap}>
                      <Text style={styles.badgeText}>{partyItem.badgeLabel}</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScreenContainer>

      <LedgerEntryEditorModal viewModel={editorViewModel} />
      <LedgerPartyDetailModal viewModel={partyDetailViewModel} />
      <LedgerDeleteModal viewModel={deleteViewModel} />
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  content: { gap: theme.scaleSpace(spacing.sm) },
  primaryActionButton: { width: "100%" },
  summaryGrid: { flexDirection: "row", gap: theme.scaleSpace(spacing.sm) },
  miniStatGrid: { flexDirection: "row", gap: theme.scaleSpace(spacing.sm) },
  agingSection: { gap: theme.scaleSpace(spacing.sm) },
  agingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.scaleSpace(spacing.sm),
  },
  agingCard: {
    width: "31%",
    minHeight: theme.scaleSpace(82),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.scaleSpace(spacing.sm),
    paddingVertical: theme.scaleSpace(spacing.xs),
    gap: theme.scaleSpace(4),
  },
  agingCardWarning: {
    borderColor: theme.colors.warning,
    backgroundColor: "rgba(245, 158, 11, 0.07)",
  },
  agingCardCritical: {
    borderColor: theme.colors.destructive,
    backgroundColor: "rgba(228, 71, 71, 0.08)",
  },
  agingLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
    fontFamily: "InterSemiBold",
  },
  agingAmount: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  agingCount: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
    fontFamily: "InterMedium",
  },
  collectionQueueContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  collectionQueueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.sm),
  },
  collectionQueueInfo: { flex: 1, gap: theme.scaleSpace(2) },
  queueTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(6),
  },
  collectionQueuePartyName: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  collectionQueueMeta: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
  },
  collectionQueueAmount: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  queueEmptyState: {
    minHeight: theme.scaleSpace(56),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.scaleSpace(spacing.md),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
  },
  queueEmptyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  searchInput: { color: theme.colors.cardForeground },
  partyListContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(13),
  },
  partyRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  partyAvatar: {
    width: theme.scaleSpace(40),
    height: theme.scaleSpace(40),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  partyTextWrap: { flex: 1, gap: theme.scaleSpace(2) },
  partyName: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  partySubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  partyAmountWrap: {
    alignItems: "flex-end",
    gap: theme.scaleSpace(2),
    maxWidth: theme.scaleSpace(138),
  },
  partyAmount: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
  },
  receiveValue: { color: theme.colors.success },
  payValue: { color: theme.colors.destructive },
  partyToneLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(10),
  },
  badgeWrap: {
    marginTop: theme.scaleSpace(3),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.scaleSpace(8),
    paddingVertical: theme.scaleSpace(4),
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.scaleText(10),
    fontFamily: "InterMedium",
  },
  centerState: {
    minHeight: theme.scaleSpace(180),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.scaleSpace(spacing.lg),
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(13),
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    textAlign: "center",
    lineHeight: theme.scaleLineHeight(20),
  },
});
