import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

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
  theme: ReturnType<typeof useAppTheme>,
): string => {
  if (tone === "positive") {
    return theme.colors.success;
  }

  if (tone === "negative") {
    return theme.colors.destructive;
  }

  return theme.colors.cardForeground;
};

export function TransactionTable({
  rows,
  emptyStateText,
  amountHeaderLabel = "Amount",
}: TransactionTableProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

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
                { color: resolveAmountToneColor(row.tone, theme) },
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

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.sm),
    backgroundColor: theme.colors.muted,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  headerLabel: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(11),
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  emptyStateRow: {
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md + 2),
  },
  emptyStateText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.sm + 2),
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowBody: {
    flex: 1,
    gap: theme.scaleSpace(2),
  },
  rowTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  rowSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  rowAmount: {
    fontSize: theme.scaleText(13),
    fontFamily: "InterBold",
    maxWidth: theme.scaleSpace(130),
    textAlign: "right",
  },
});
