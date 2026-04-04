import { BudgetViewModel } from "@/feature/budget/viewModel/budget.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { Pill } from "@/shared/components/reusable/List/Pill";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type BudgetDetailModalProps = {
  viewModel: BudgetViewModel;
};

export function BudgetDetailModal({
  viewModel,
}: BudgetDetailModalProps) {
  const detailState = viewModel.detailState;

  return (
    <FormSheetModal
      visible={viewModel.isDetailVisible}
      title={detailState?.title ?? "Budget Detail"}
      subtitle={detailState?.subtitle ?? undefined}
      onClose={viewModel.onCloseDetail}
      closeAccessibilityLabel="Close budget detail"
      contentContainerStyle={styles.content}
      presentation="dialog"
    >
      {detailState ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Pill
              label={detailState.statusLabel}
              tone={detailState.statusLabel === "Over budget" ? "danger" : "success"}
            />
          </View>

          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Planned</Text>
              <Text style={styles.summaryValue}>{detailState.plannedAmountLabel}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={styles.summaryValue}>{detailState.spentAmountLabel}</Text>
            </Card>
          </View>

          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>
              {detailState.statusLabel === "Over budget" ? "Over by" : "Left"}
            </Text>
            <Text
              style={[
                styles.noteValue,
                detailState.statusLabel === "Over budget"
                  ? styles.overValue
                  : styles.leftValue,
              ]}
            >
              {detailState.remainingAmountLabel}
            </Text>
            {detailState.noteLabel ? (
              <Text style={styles.noteText}>{detailState.noteLabel}</Text>
            ) : null}
          </Card>

          <View style={styles.actionRow}>
            <AppButton
              label="Delete"
              variant="secondary"
              size="lg"
              style={styles.actionButton}
              onPress={() => void viewModel.onDeleteActiveBudget()}
            />
            <AppButton
              label="Edit"
              variant="primary"
              size="lg"
              style={styles.actionButton}
              onPress={() => void viewModel.onEditFromDetail()}
            />
          </View>
        </>
      ) : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  noteCard: {
    gap: 4,
  },
  noteTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterBold",
  },
  noteValue: {
    fontSize: 20,
    fontFamily: "InterBold",
  },
  overValue: {
    color: colors.destructive,
  },
  leftValue: {
    color: colors.success,
  },
  noteText: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
