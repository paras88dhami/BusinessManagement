import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";

export type TransactionTableRow = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  tone: "positive" | "negative" | "neutral";
};

type TransactionTableProps = {
  rows: readonly TransactionTableRow[];
  emptyStateText: string;
  amountHeaderLabel?: string;
};

const resolveAmountToneColor = (
  tone: TransactionTableRow["tone"],
): string => {
  if (tone === "positive") {
    return colors.success;
  }

  if (tone === "negative") {
    return colors.destructive;
  }

  return colors.cardForeground;
};

export function TransactionTable({
  rows,
  emptyStateText,
  amountHeaderLabel = "Amount",
}: TransactionTableProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Transaction</Text>
        <Text style={styles.headerLabel}>{amountHeaderLabel}</Text>
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyStateRow}>
          <Text style={styles.emptyStateText}>{emptyStateText}</Text>
        </View>
      ) : (
        rows.map((row, index) => (
          <View
            key={row.id}
            style={[
              styles.dataRow,
              index < rows.length - 1 ? styles.rowDivider : null,
            ]}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
            </View>

            <Text
              style={[
                styles.rowAmount,
                { color: resolveAmountToneColor(row.tone) },
              ]}
            >
              {row.amount}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.muted,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  headerLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  emptyStateRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  emptyStateText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  rowSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  rowAmount: {
    fontSize: 13,
    fontFamily: "InterBold",
    maxWidth: 130,
    textAlign: "right",
  },
});
