import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { OrderStatus } from "@/feature/orders/types/order.types";
import { OrdersViewModel } from "@/feature/orders/viewModel/orders.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { Pill } from "@/shared/components/reusable/List/Pill";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Box, Plus } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { OrderEditorModal } from "./components/OrderEditorModal";
import { OrderMoneyActionModal } from "./components/OrderMoneyActionModal";
import { OrderStatusModal } from "./components/OrderStatusModal";

const getStatusTone = (status: string) => {
  switch (status) {
    case OrderStatus.Delivered:
      return "success" as const;
    case OrderStatus.Returned:
      return "warning" as const;
    case OrderStatus.Cancelled:
      return "danger" as const;
    default:
      return "neutral" as const;
  }
};

export function OrdersScreen({ viewModel }: { viewModel: OrdersViewModel }) {
  const orderItems = Array.isArray(viewModel.orders) ? viewModel.orders : [];

  const confirmDelete = useCallback(() => {
    if (!viewModel.detail) {
      return;
    }
    Alert.alert("Delete order", `Delete ${viewModel.detail.order.orderNumber}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void viewModel.onDelete(viewModel.detail!.order.remoteId);
        },
      },
    ]);
  }, [viewModel]);

  const confirmCancel = useCallback(() => {
    if (!viewModel.detail) {
      return;
    }
    Alert.alert(
      "Cancel order",
      `Cancel ${viewModel.detail.order.orderNumber}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => {
            void viewModel.onCancelOrder();
          },
        },
      ],
    );
  }, [viewModel]);

  const confirmReturn = useCallback(() => {
    if (!viewModel.detail) {
      return;
    }
    Alert.alert(
      "Mark returned",
      `Mark ${viewModel.detail.order.orderNumber} as returned?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Mark Returned",
          onPress: () => {
            void viewModel.onReturnOrder();
          },
        },
      ],
    );
  }, [viewModel]);

  return (
    <>
      <DashboardTabScaffold
        footer={
          <BottomTabAwareFooter>
            <AppButton
              label="Add Order"
              size="lg"
              style={styles.primaryActionButton}
              leadingIcon={<Plus size={18} color={colors.primaryForeground} />}
              onPress={viewModel.onOpenCreate}
              disabled={!viewModel.canManage}
            />
          </BottomTabAwareFooter>
        }
        baseBottomPadding={140}
        contentContainerStyle={styles.content}
        showDivider={false}
      >
        <View style={styles.summaryRow}>
          <StatCard
            icon={<Text style={styles.statIcon}>#</Text>}
            value={String(viewModel.summary.totalOrders)}
            label="Total"
          />
          <StatCard
            icon={<Text style={styles.statIcon}>~</Text>}
            value={String(viewModel.summary.pendingCount)}
            label="Pending"
          />
          <StatCard
            icon={<Text style={styles.statIcon}>D</Text>}
            value={String(viewModel.summary.deliveredCount)}
            label="Delivered"
            valueColor={colors.success}
          />
          <StatCard
            icon={<Text style={styles.statIcon}>R</Text>}
            value={String(viewModel.summary.returnedCount)}
            label="Returned"
            valueColor={colors.warning}
          />
        </View>

        {viewModel.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : viewModel.errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          </View>
        ) : orderItems.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>No orders have been created yet.</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {orderItems.map((order) => (
              <Pressable
                key={order.remoteId}
                style={styles.orderCard}
                onPress={() => {
                  void viewModel.onOpenDetail(order.remoteId);
                }}
              >
                <View style={styles.orderHeaderRow}>
                  <View style={styles.orderIconWrap}>
                    <Box size={18} color={colors.primary} />
                  </View>
                  <View style={styles.orderHeaderTextWrap}>
                    <Text style={styles.orderTitle}>{order.orderNumber}</Text>
                    <Text style={styles.orderSubtitle}>{order.customerName}</Text>
                  </View>
                  <Pill
                    label={order.status.replace(/(^|\s)\w/g, (match) => match.toUpperCase())}
                    tone={getStatusTone(order.status)}
                  />
                </View>

                <Text style={styles.itemsPreview}>{order.itemsPreview}</Text>

                <View style={styles.orderMetaRow}>
                  <Text style={styles.orderMetaText}>{order.itemCountLabel}</Text>
                  <Text style={styles.orderMetaText}>{order.orderDateLabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </DashboardTabScaffold>

      <OrderEditorModal
        visible={viewModel.isEditorVisible}
        mode={viewModel.editorMode}
        canManage={viewModel.canManage}
        form={viewModel.form}
        customerOptions={viewModel.customerOptions}
        productOptions={viewModel.productOptions}
        statusOptions={viewModel.statusOptions}
        onClose={viewModel.onCloseEditor}
        onChange={viewModel.onFormChange}
        onLineItemChange={viewModel.onLineItemChange}
        onAddLineItem={viewModel.onAddLineItem}
        onRemoveLineItem={viewModel.onRemoveLineItem}
        onSubmit={viewModel.onSubmit}
      />

      <OrderDetailModal
        visible={viewModel.isDetailVisible}
        canManage={viewModel.canManage}
        detail={viewModel.detail}
        onClose={viewModel.onCloseDetail}
        onOpenEdit={viewModel.onOpenEdit}
        onOpenStatus={viewModel.onOpenStatusModal}
        onOpenPayment={() => viewModel.onOpenMoneyAction("payment")}
        onOpenRefund={() => viewModel.onOpenMoneyAction("refund")}
        onReturnOrder={confirmReturn}
        onCancelOrder={confirmCancel}
        onDelete={() => confirmDelete()}
      />

      <OrderStatusModal
        visible={viewModel.isStatusModalVisible}
        value={viewModel.statusDraft}
        options={viewModel.statusOptions}
        onChange={viewModel.onStatusDraftChange}
        onClose={viewModel.onCloseStatusModal}
        onSubmit={viewModel.onSubmitStatus}
      />

      <OrderMoneyActionModal
        form={viewModel.moneyForm}
        onClose={viewModel.onCloseMoneyAction}
        onChange={viewModel.onMoneyFormChange}
        onSubmit={viewModel.onSubmitMoneyAction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  primaryActionButton: {
    width: "100%",
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  statIcon: {
    color: colors.primary,
    fontFamily: "InterBold",
    fontSize: 18,
  },
  centerState: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    textAlign: "center",
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 13,
    textAlign: "center",
  },
  listWrap: {
    gap: spacing.sm,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  orderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  orderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  orderHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  orderTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  orderSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  itemsPreview: {
    color: colors.cardForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  orderMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  orderMetaText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
});


