import { TransactionType } from "@/feature/transactions/types/transaction.entity.types";
import { TransactionListFilter } from "@/feature/transactions/types/transaction.state.types";
import { TransactionDeleteViewModel } from "@/feature/transactions/viewModel/transactionDelete.viewModel";
import { TransactionEditorViewModel } from "@/feature/transactions/viewModel/transactionEditor.viewModel";
import { TransactionsListViewModel } from "@/feature/transactions/viewModel/transactionsList.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { ScreenContainer } from "@/shared/components/reusable/ScreenLayouts/ScreenContainer";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Pencil,
    Trash2,
} from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { TransactionDeleteModal } from "./components/TransactionDeleteModal";
import { TransactionEditorModal } from "./components/TransactionEditorModal";

type TransactionsScreenProps = {
  listViewModel: TransactionsListViewModel;
  editorViewModel: TransactionEditorViewModel;
  deleteViewModel: TransactionDeleteViewModel;
  canManage: boolean;
};

const FILTER_OPTIONS = [
  { label: "All Types", value: TransactionListFilter.All },
  { label: "Income", value: TransactionListFilter.Income },
  { label: "Expense", value: TransactionListFilter.Expense },
  { label: "Transfer", value: TransactionListFilter.Transfer },
] as const;

export function TransactionsScreen({
  listViewModel,
  editorViewModel,
  deleteViewModel,
  canManage,
}: TransactionsScreenProps) {
  const theme = useAppTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          gap: theme.scaleSpace(spacing.sm),
        },
        summaryRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.scaleSpace(spacing.sm),
        },
        summaryCard: {
          width: "48.2%",
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.xs),
          paddingVertical: theme.scaleSpace(spacing.sm),
          minHeight: theme.scaleSpace(74),
        },
        summaryCardWide: {
          width: "100%",
        },
        summaryIconWrap: {
          width: theme.scaleSpace(34),
          height: theme.scaleSpace(34),
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
        },
        incomeIconWrap: {
          backgroundColor: theme.isDarkMode
            ? "rgba(99, 211, 148, 0.14)"
            : "rgba(46, 139, 87, 0.12)",
        },
        expenseIconWrap: {
          backgroundColor: theme.isDarkMode
            ? "rgba(255, 107, 107, 0.14)"
            : "rgba(228, 71, 71, 0.12)",
        },
        neutralIconWrap: {
          backgroundColor: theme.colors.secondary,
        },
        voidedIconWrap: {
          backgroundColor: theme.colors.muted,
        },
        summaryTextWrap: {
          flex: 1,
        },
        summaryLabel: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(11),
          lineHeight: theme.scaleLineHeight(14),
          marginBottom: 3,
        },
        summaryValue: {
          fontSize: theme.scaleText(16),
          lineHeight: theme.scaleLineHeight(20),
          fontFamily: "InterBold",
        },
        incomeValue: {
          color: theme.colors.success,
        },
        expenseValue: {
          color: theme.colors.destructive,
        },
        neutralValue: {
          color: theme.colors.foreground,
        },
        searchRow: {
          flexDirection: "row",
          gap: theme.scaleSpace(spacing.sm),
          alignItems: "center",
        },
        searchInputWrap: {
          flex: 1,
          minHeight: theme.scaleSpace(52),
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondary,
          justifyContent: "center",
          paddingHorizontal: theme.scaleSpace(12),
        },
        searchInput: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(14),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
        },
        filterLabel: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(11),
          fontFamily: "InterBold",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginTop: 2,
        },
        filterScroll: {
          flexGrow: 0,
          flexShrink: 0,
        },
        filterRow: {
          paddingRight: theme.scaleSpace(spacing.md),
        },
        filterChip: {
          paddingHorizontal: theme.scaleSpace(16),
          paddingVertical: theme.scaleSpace(10),
          borderRadius: radius.pill,
          backgroundColor: theme.colors.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        filterChipSelected: {
          backgroundColor: theme.isDarkMode
            ? theme.colors.accent
            : theme.colors.primary,
          borderColor: theme.isDarkMode
            ? theme.colors.foreground
            : theme.colors.primary,
        },
        filterChipText: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(11),
          lineHeight: theme.scaleLineHeight(14),
          fontFamily: "InterBold",
        },
        filterChipTextSelected: {
          color: theme.isDarkMode
            ? theme.colors.foreground
            : theme.colors.primaryForeground,
        },
        loaderWrap: {
          paddingVertical: theme.scaleSpace(spacing.xl),
          alignItems: "center",
        },
        messageCard: {
          paddingVertical: theme.scaleSpace(spacing.lg),
        },
        errorText: {
          color: theme.colors.destructive,
          fontSize: theme.scaleText(13),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterMedium",
        },
        emptyText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(13),
          lineHeight: theme.scaleLineHeight(20),
        },
        listCard: {
          paddingHorizontal: 0,
          paddingVertical: 0,
          overflow: "hidden",
        },
        transactionRow: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.scaleSpace(spacing.md),
          paddingVertical: theme.scaleSpace(spacing.sm),
          gap: theme.scaleSpace(spacing.xs),
        },
        transactionRowLast: {
          borderBottomWidth: 0,
        },
        transactionMainPressable: {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.scaleSpace(spacing.sm),
        },
        transactionIconWrap: {
          width: theme.scaleSpace(36),
          height: theme.scaleSpace(36),
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
        },
        transactionBody: {
          flex: 1,
          gap: 2,
        },
        transactionTitle: {
          color: theme.colors.cardForeground,
          fontSize: theme.scaleText(14),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterBold",
        },
        voidedText: {
          color: theme.colors.mutedForeground,
        },
        partyLabel: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(11),
          lineHeight: theme.scaleLineHeight(14),
          fontFamily: "InterSemiBold",
        },
        transactionSubtitle: {
          color: theme.colors.mutedForeground,
          fontSize: theme.scaleText(11),
          lineHeight: theme.scaleLineHeight(14),
        },
        metaRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginLeft: theme.scaleSpace(46),
          marginTop: 2,
        },
        metaChip: {
          borderRadius: radius.pill,
          paddingHorizontal: theme.scaleSpace(8),
          paddingVertical: theme.scaleSpace(4),
        },
        metaChipNeutral: {
          backgroundColor: theme.colors.secondary,
        },
        metaChipSuccess: {
          backgroundColor: theme.isDarkMode
            ? "rgba(99, 211, 148, 0.14)"
            : "rgba(46, 139, 87, 0.12)",
        },
        metaChipWarning: {
          backgroundColor: theme.isDarkMode
            ? "rgba(244, 193, 93, 0.14)"
            : "rgba(242, 168, 29, 0.14)",
        },
        metaChipDanger: {
          backgroundColor: theme.isDarkMode
            ? "rgba(255, 107, 107, 0.14)"
            : "rgba(228, 71, 71, 0.12)",
        },
        metaChipText: {
          fontSize: theme.scaleText(10),
          lineHeight: theme.scaleLineHeight(12),
          fontFamily: "InterSemiBold",
        },
        metaChipTextNeutral: {
          color: theme.colors.cardForeground,
        },
        metaChipTextSuccess: {
          color: theme.colors.success,
        },
        metaChipTextWarning: {
          color: theme.colors.warning,
        },
        metaChipTextDanger: {
          color: theme.colors.destructive,
        },
        transactionAmount: {
          fontSize: theme.scaleText(14),
          lineHeight: theme.scaleLineHeight(18),
          fontFamily: "InterBold",
          minWidth: theme.scaleSpace(90),
          textAlign: "right",
        },
        voidedAmount: {
          color: theme.colors.mutedForeground,
          textDecorationLine: "line-through",
        },
        transactionActions: {
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: theme.scaleSpace(spacing.xs),
        },
        rowActionButton: {
          width: theme.scaleSpace(32),
          height: theme.scaleSpace(32),
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.secondary,
        },
        footer: {
          backgroundColor: theme.colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          paddingHorizontal: theme.scaleSpace(spacing.lg),
          paddingTop: theme.scaleSpace(spacing.md),
          paddingBottom: 95,
        },
        actionRow: {
          flexDirection: "row",
          gap: theme.scaleSpace(spacing.sm),
        },
        actionButton: {
          flex: 1,
        },
        expenseButton: {
          backgroundColor: theme.colors.destructive,
        },
      }),
    [theme],
  );

  return (
    <>
      <ScreenContainer
        showDivider={false}
        padded={true}
        contentContainerStyle={styles.content}
        baseBottomPadding={170}
        footer={
          canManage ? (
            <View style={styles.footer}>
              <View style={styles.actionRow}>
                <AppButton
                  label="Income"
                  variant="primary"
                  size="lg"
                  style={styles.actionButton}
                  leadingIcon={
                    <ArrowDownLeft
                      size={18}
                      color={theme.colors.primaryForeground}
                    />
                  }
                  onPress={() => listViewModel.onOpenCreate(TransactionType.Income)}
                />
                <AppButton
                  label="Expense"
                  variant="primary"
                  size="lg"
                  style={[styles.actionButton, styles.expenseButton]}
                  leadingIcon={
                    <ArrowUpRight
                      size={18}
                      color={theme.colors.primaryForeground}
                    />
                  }
                  onPress={() => listViewModel.onOpenCreate(TransactionType.Expense)}
                />
                <AppButton
                  label="Transfer"
                  variant="primary"
                  size="lg"
                  style={styles.actionButton}
                  leadingIcon={
                    <ArrowLeftRight
                      size={18}
                      color={theme.colors.primaryForeground}
                    />
                  }
                  onPress={() => listViewModel.onOpenCreate(TransactionType.Transfer)}
                />
              </View>
            </View>
          ) : null
        }
      >
        <View style={styles.summaryRow}>
          {listViewModel.summaryCards.map((summaryCard) => {
            const isIncome = summaryCard.tone === "income";
            const isExpense = summaryCard.tone === "expense";
            const isNet = summaryCard.tone === "neutral";

            return (
              <Card
                key={summaryCard.id}
                style={[styles.summaryCard, isNet ? styles.summaryCardWide : null]}
              >
                <View
                  style={[
                    styles.summaryIconWrap,
                    isIncome
                      ? styles.incomeIconWrap
                      : isExpense
                        ? styles.expenseIconWrap
                        : styles.neutralIconWrap,
                  ]} 
                >
                  {isIncome ? (
                    <ArrowDownLeft size={16} color={theme.colors.success} />
                  ) : isExpense ? (
                    <ArrowUpRight size={16} color={theme.colors.destructive} />
                  ) : (
                    <ArrowLeftRight size={16} color={theme.colors.foreground} />
                  )}
                </View>

                <View style={styles.summaryTextWrap}>
                  <Text style={styles.summaryLabel}>{summaryCard.label}</Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.85}
                    style={[
                      styles.summaryValue,
                      isIncome
                        ? styles.incomeValue
                        : isExpense
                          ? styles.expenseValue
                          : styles.neutralValue,
                    ]}
                  >
                    {summaryCard.value}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <TextInput
              value={listViewModel.searchQuery}
              onChangeText={listViewModel.onChangeSearchQuery}
              placeholder="Search party, note, source..."
              placeholderTextColor={theme.colors.mutedForeground}
              style={styles.searchInput}
            />
          </View>
        </View>

        <Text style={styles.filterLabel}>Type</Text>
        <FilterChipGroup
          options={FILTER_OPTIONS}
          selectedValue={listViewModel.selectedFilter}
          onSelect={listViewModel.onChangeFilter}
          scrollStyle={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
          chipStyle={styles.filterChip}
          selectedChipStyle={styles.filterChipSelected}
          chipTextStyle={styles.filterChipText}
          selectedChipTextStyle={styles.filterChipTextSelected}
        />


        {listViewModel.errorMessage ? (
          <Card style={styles.messageCard}>
            <Text style={styles.errorText}>{listViewModel.errorMessage}</Text>
          </Card>
        ) : null}

        {listViewModel.isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : listViewModel.transactionItems.length === 0 ? (
          <Card style={styles.messageCard}>
            <Text style={styles.emptyText}>{listViewModel.emptyStateMessage}</Text>
          </Card>
        ) : (
          <Card style={styles.listCard}>
            {listViewModel.transactionItems.map((transactionItem, index) => {
              const iconColor = transactionItem.isVoided
                ? theme.colors.mutedForeground
                : transactionItem.transactionType === TransactionType.Transfer
                  ? theme.colors.foreground
                  : transactionItem.tone === "income"
                    ? theme.colors.success
                    : theme.colors.destructive;
              const icon =
                transactionItem.transactionType === TransactionType.Transfer ? (
                  <ArrowLeftRight size={16} color={iconColor} />
                ) : transactionItem.tone === "income" ? (
                  <ArrowDownLeft size={16} color={iconColor} />
                ) : (
                  <ArrowUpRight size={16} color={iconColor} />
                );

              return (
                <View
                  key={transactionItem.remoteId}
                  style={[
                    styles.transactionRow,
                    index === listViewModel.transactionItems.length - 1
                      ? styles.transactionRowLast
                      : null,
                  ]}
                >
                  <Pressable
                    style={styles.transactionMainPressable}
                    onPress={
                      canManage && !transactionItem.isVoided
                        ? () => listViewModel.onOpenEdit(transactionItem.remoteId)
                        : undefined
                    }
                    disabled={!canManage || transactionItem.isVoided}
                  >
                    <View
                      style={[
                        styles.transactionIconWrap,
                        transactionItem.isVoided
                          ? styles.voidedIconWrap
                          : transactionItem.transactionType === TransactionType.Transfer
                            ? styles.neutralIconWrap
                          : transactionItem.tone === "income"
                            ? styles.incomeIconWrap
                            : styles.expenseIconWrap,
                      ]}
                    >
                      {icon}
                    </View>

                    <View style={styles.transactionBody}>
                      <Text
                        style={[
                          styles.transactionTitle,
                          transactionItem.isVoided ? styles.voidedText : null,
                        ]}
                      >
                        {transactionItem.title}
                      </Text>
                      {transactionItem.partyLabel ? (
                        <Text style={styles.partyLabel}>
                          Party: {transactionItem.partyLabel}
                        </Text>
                      ) : null}
                      <Text style={styles.transactionSubtitle}>
                        {transactionItem.subtitle}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.transactionAmount,
                        transactionItem.isVoided
                          ? styles.voidedAmount
                          : transactionItem.transactionType === TransactionType.Transfer
                            ? styles.neutralValue
                          : transactionItem.tone === "income"
                            ? styles.incomeValue
                            : styles.expenseValue,
                      ]}
                    >
                      {transactionItem.amountLabel}
                    </Text>
                  </Pressable>

                  <View style={styles.metaRow}>
                    {transactionItem.metaChips.map((chip) => (
                      <View
                        key={`${transactionItem.remoteId}-${chip.label}`}
                        style={[
                          styles.metaChip,
                          chip.tone === "success"
                            ? styles.metaChipSuccess
                            : chip.tone === "danger"
                              ? styles.metaChipDanger
                              : chip.tone === "warning"
                                ? styles.metaChipWarning
                                : styles.metaChipNeutral,
                        ]}
                      >
                        <Text
                          style={[
                            styles.metaChipText,
                            chip.tone === "success"
                              ? styles.metaChipTextSuccess
                              : chip.tone === "danger"
                                ? styles.metaChipTextDanger
                                : chip.tone === "warning"
                                  ? styles.metaChipTextWarning
                                  : styles.metaChipTextNeutral,
                          ]}
                        >
                          {chip.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {canManage && !transactionItem.isVoided ? (
                    <View style={styles.transactionActions}>
                      <Pressable
                        style={styles.rowActionButton}
                        onPress={() => listViewModel.onOpenEdit(transactionItem.remoteId)}
                      >
                        <Pencil size={16} color={theme.colors.mutedForeground} />
                      </Pressable>
                      <Pressable
                        style={styles.rowActionButton}
                        onPress={() =>
                          deleteViewModel.openDelete(transactionItem.remoteId)
                        }
                      >
                        <Trash2 size={16} color={theme.colors.destructive} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </Card>
        )}
      </ScreenContainer>

      <TransactionEditorModal viewModel={editorViewModel} />
      <TransactionDeleteModal viewModel={deleteViewModel} />
    </>
  );
}
