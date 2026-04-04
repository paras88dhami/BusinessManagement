import { OrderStatus } from "@/feature/orders/types/order.types";
import { OrderDetailView } from "@/feature/orders/viewModel/orders.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { Pill } from "@/shared/components/reusable/List/Pill";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

const getStatusTone = (status: OrderDetailView["order"]["status"]) => {
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

type Props = {
  visible: boolean;
  canManage: boolean;
  detail: OrderDetailView | null;
  onClose: () => void;
  onOpenEdit: (remoteId: string) => Promise<void>;
  onOpenStatus: () => void;
  onOpenPayment: () => void;
  onOpenRefund: () => void;
  onReturnOrder: () => void;
  onCancelOrder: () => void;
  onDelete: (remoteId: string) => void;
};

export function OrderDetailModal({
  visible,
  canManage,
  detail,
  onClose,
  onOpenEdit,
  onOpenStatus,
  onOpenPayment,
  onOpenRefund,
  onReturnOrder,
  onCancelOrder,
  onDelete,
}: Props) {
  return (
    <FormSheetModal
      visible={visible}
      title={detail ? detail.order.orderNumber : "Order Detail"}
      subtitle={detail ? detail.customerName : "Loading order detail"}
      onClose={onClose}
      presentation="dialog"
      contentContainerStyle={styles.content}
    >
      {!detail ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Pill label={detail.order.status.replace(/(^|\s)\w/g, (match) => match.toUpperCase())} tone={getStatusTone(detail.order.status)} />
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Date</Text>
              <Text style={styles.summaryValue}>{detail.orderDateLabel}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer</Text>
              <Text style={styles.summaryValue}>{detail.customerName}</Text>
            </View>
          </View>

          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Items</Text>
            <View style={styles.sectionCard}>
              {detail.items.map((item) => (
                <View key={item.remoteId} style={styles.lineRow}>
                  <Text style={styles.lineTitle}>{item.productName}</Text>
                  <Text style={styles.lineValue}>Qty {item.quantityLabel}</Text>
                </View>
              ))}
            </View>
          </View>

          {detail.order.deliveryOrPickupDetails ? (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Delivery / Pickup</Text>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionBodyText}>{detail.order.deliveryOrPickupDetails}</Text>
              </View>
            </View>
          ) : null}

          {detail.order.tags ? (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionBodyText}>{detail.order.tags}</Text>
              </View>
            </View>
          ) : null}

          {detail.order.internalRemarks ? (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Internal Remarks</Text>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionBodyText}>{detail.order.internalRemarks}</Text>
              </View>
            </View>
          ) : null}

          {detail.order.notes ? (
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionBodyText}>{detail.order.notes}</Text>
              </View>
            </View>
          ) : null}

          {canManage ? (
            <View style={styles.actionWrap}>
              <AppButton
                label="Edit Order"
                size="lg"
                style={styles.fullButton}
                onPress={() => void onOpenEdit(detail.order.remoteId)}
              />
              <AppButton
                label="Change Status"
                size="lg"
                variant="secondary"
                style={styles.fullButton}
                onPress={onOpenStatus}
              />
              <View style={styles.twoColumnRow}>
                <AppButton
                  label="Record Payment"
                  size="md"
                  variant="secondary"
                  style={styles.flexButton}
                  onPress={onOpenPayment}
                />
                <AppButton
                  label="Refund"
                  size="md"
                  variant="secondary"
                  style={styles.flexButton}
                  onPress={onOpenRefund}
                />
              </View>
              <View style={styles.twoColumnRow}>
                <AppButton
                  label="Mark Returned"
                  size="md"
                  variant="secondary"
                  style={styles.flexButton}
                  onPress={onReturnOrder}
                />
                <AppButton
                  label="Cancel Order"
                  size="md"
                  variant="secondary"
                  style={styles.flexButton}
                  onPress={onCancelOrder}
                />
              </View>
              <Pressable onPress={() => onDelete(detail.order.remoteId)}>
                <Text style={styles.deleteText}>Delete Order</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  centerState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  summaryValue: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterSemiBold",
    flexShrink: 1,
    textAlign: "right",
  },
  sectionWrap: {
    gap: 6,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  lineTitle: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterSemiBold",
    flex: 1,
  },
  lineValue: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  sectionBodyText: {
    color: colors.cardForeground,
    fontSize: 13,
    lineHeight: 20,
  },
  actionWrap: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  fullButton: {
    width: "100%",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  deleteText: {
    color: colors.destructive,
    fontSize: 13,
    fontFamily: "InterBold",
    textAlign: "center",
    paddingVertical: spacing.xs,
  },
});
