import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Package,
} from "lucide-react-native";
import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { InventoryViewModel } from "@/feature/inventory/viewModel/inventory.viewModel";
import { InventoryMovementType } from "@/feature/inventory/types/inventory.types";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { InventoryMovementModal } from "./components/InventoryMovementModal";

const formatCurrency = (value: number): string => {
  if (value >= 1000 && value % 1000 === 0) {
    return `NPR ${Math.round(value / 1000)}K`;
  }

  return `NPR ${value.toLocaleString()}`;
};

const formatMovementDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatKey = (value: Date): string =>
    `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;

  const currentKey = formatKey(date);
  if (currentKey === formatKey(today)) {
    return "Today";
  }
  if (currentKey === formatKey(yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

export function   InventoryScreen({ viewModel }: { viewModel: InventoryViewModel }) {
  const lowStockItems = viewModel.stockItems.filter((item) => item.isLowStock);

  return (
    <DashboardTabScaffold>
      <View style={styles.summaryRow}>
        <StatCard
          icon={<Package size={18} color={colors.primary} />}
          value={String(viewModel.summary.totalProducts)}
          label="Products"
        />
        <StatCard
          icon={<AlertTriangle size={18} color={colors.warning} />}
          value={String(viewModel.summary.lowStockCount)}
          label="Low Stock"
          valueColor={colors.warning}
        />
        <StatCard
          icon={<Text style={styles.currencyIcon}>Rs</Text>}
          value={formatCurrency(viewModel.summary.stockValue)}
          label="Stock Value"
        />
      </View>

      {lowStockItems.length > 0 ? (
        <Card style={styles.bannerCard}>
          <View style={styles.bannerIconWrap}>
            <AlertTriangle size={18} color={colors.warning} />
          </View>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerTitle}>{`${lowStockItems.length} items low on stock`}</Text>
            <Text style={styles.bannerSubtitle}>Restock soon to avoid disruptions</Text>
          </View>
        </Card>
      ) : null}

      {viewModel.errorMessage ? <Text style={styles.errorText}>{viewModel.errorMessage}</Text> : null}
      {viewModel.isLoading ? <ActivityIndicator color={colors.primary} /> : null}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Stock on Hand</Text>
        <Text style={styles.sectionAction}>View All</Text>
      </View>

      <View style={styles.listWrap}>
        {viewModel.stockItems.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No item products available for inventory yet.</Text>
          </Card>
        ) : (
          viewModel.stockItems.map((item) => (
            <Card key={item.productRemoteId} style={styles.listCard}>
              <View style={styles.iconWrap}>
                <Boxes size={20} color={colors.primary} />
              </View>
              <View style={styles.listBody}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.stockQuantity} {item.unitLabel ?? "unit"} in stock
                </Text>
              </View>
              <View style={styles.valueWrap}>
                <Text style={styles.valueText}>{formatCurrency(item.stockValue)}</Text>
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Movements</Text>
        <Text style={styles.sectionAction}>View All</Text>
      </View>

      <Card style={styles.movementCard}>
        {viewModel.recentMovements.length === 0 ? (
          <Text style={styles.emptyText}>No inventory movement yet.</Text>
        ) : (
          viewModel.recentMovements.map((movement, index) => {
            const isPositive = movement.deltaQuantity > 0;
            const isLast = index === viewModel.recentMovements.length - 1;
            return (
              <View
                key={movement.remoteId}
                style={[styles.movementRow, !isLast ? styles.movementRowBorder : null]}
              >
                <View style={[styles.iconWrap, isPositive ? styles.positiveIcon : styles.negativeIcon]}>
                  {isPositive ? (
                    <ArrowDownLeft size={18} color={colors.success} />
                  ) : (
                    <ArrowUpRight size={18} color={colors.destructive} />
                  )}
                </View>
                <View style={styles.listBody}>
                  <Text style={styles.itemTitle}>{movement.productName}</Text>
                  <Text style={styles.itemSubtitle}>
                    {formatMovementDate(movement.movementAt)} | {movement.type === InventoryMovementType.StockIn ? "Purchase" : movement.type === InventoryMovementType.SaleOut ? "Sale" : movement.reason ? movement.reason.replace("_", " ") : "Adjustment"}
                  </Text>
                </View>
                <Text style={[styles.deltaText, isPositive ? styles.deltaPositive : styles.deltaNegative]}>
                  {isPositive ? "+" : "-"}
                  {Math.abs(movement.deltaQuantity)} {movement.productUnitLabel ?? "unit"}
                </Text>
              </View>
            );
          })
        )}
      </Card>

      <View style={styles.buttonRow}>
        <AppButton
          label="Stock In"
          variant="primary"
          size="lg"
          style={styles.flexButton}
          leadingIcon={<ArrowDownLeft size={18} color={colors.primaryForeground} />}
          onPress={viewModel.onOpenStockIn}
          disabled={!viewModel.canManage}
        />
        <AppButton
          label="Adjust"
          variant="secondary"
          size="lg"
          style={styles.flexButton}
          leadingIcon={<ArrowUpRight size={18} color={colors.primary} />}
          onPress={viewModel.onOpenAdjustment}
          disabled={!viewModel.canManage}
        />
      </View>

      <InventoryMovementModal
        visible={viewModel.isEditorVisible}
        editorType={viewModel.editorType}
        title={viewModel.editorTitle}
        form={viewModel.form}
        productOptions={viewModel.productOptions}
        adjustmentReasonOptions={viewModel.adjustmentReasonOptions}
        onClose={viewModel.onCloseEditor}
        onChange={viewModel.onFormChange}
        onSubmit={viewModel.onSubmit}
      />
    </DashboardTabScaffold>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  currencyIcon: {
    color: colors.primary,
    fontFamily: "InterBold",
    fontSize: 18,
  },
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#F7F0E1",
    borderColor: "#E8D6A7",
  },
  bannerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6DA",
  },
  bannerBody: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 15,
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 18,
  },
  sectionAction: {
    color: colors.primary,
    fontFamily: "InterMedium",
    fontSize: 13,
  },
  listWrap: {
    gap: spacing.sm,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  positiveIcon: {
    backgroundColor: "#E7F6EC",
  },
  negativeIcon: {
    backgroundColor: "#FBE9E9",
  },
  listBody: {
    flex: 1,
  },
  itemTitle: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 15,
    marginBottom: 4,
  },
  itemSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    textTransform: "none",
  },
  valueWrap: {
    alignItems: "flex-end",
  },
  valueText: {
    color: colors.cardForeground,
    fontFamily: "InterBold",
    fontSize: 14,
  },
  movementCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  movementRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deltaText: {
    fontFamily: "InterBold",
    fontSize: 14,
  },
  deltaPositive: {
    color: colors.success,
  },
  deltaNegative: {
    color: colors.destructive,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});

