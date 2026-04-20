import {
  OrderFormPricingPreview,
  OrderFormState,
  OrderLineFormState,
} from "@/feature/orders/types/order.state.types";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import {
  Dropdown,
  DropdownOption,
} from "@/shared/components/reusable/DropDown/Dropdown";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Plus, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  mode: "create" | "edit";
  canManage: boolean;
  form: OrderFormState;
  formPricingPreview: OrderFormPricingPreview;
  customerOptions: DropdownOption[];
  customerPhoneByRemoteId: Readonly<Record<string, string | null>>;
  productOptions: DropdownOption[];
  productPriceByRemoteId: Readonly<Record<string, number>>;
  paymentMethodOptions: readonly DropdownOption[];
  onClose: () => void;
  onChange: (field: keyof Omit<OrderFormState, "items">, value: string) => void;
  onLineItemChange: (
    remoteId: string,
    field: keyof OrderLineFormState,
    value: string,
  ) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (remoteId: string) => void;
  onSubmit: () => Promise<void>;
};

const formatCompactAmount = (amount: number): string => {
  if (!Number.isFinite(amount)) {
    return "0";
  }

  if (Math.round(amount) === amount) {
    return String(amount);
  }

  return amount.toFixed(2);
};

export function OrderEditorModal({
  visible,
  mode,
  canManage,
  form,
  formPricingPreview,
  customerOptions,
  customerPhoneByRemoteId,
  productOptions,
  productPriceByRemoteId,
  paymentMethodOptions,
  onClose,
  onChange,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
  onSubmit,
}: Props) {
  const title =
    mode === "create" ? "Create Order" : `Edit ${form.orderNumber || "Order"}`;
  const lineItems = Array.isArray(form.items) ? form.items : [];
  const selectedCustomerPhone = form.customerRemoteId
    ? customerPhoneByRemoteId[form.customerRemoteId] ?? ""
    : "";

  return (
    <FormSheetModal
      visible={visible}
      title={title}
      onClose={onClose}
      presentation="dialog"
      contentContainerStyle={styles.content}
      footer={
        <AppButton
          label={mode === "create" ? "Create Order" : "Update Order"}
          size="lg"
          style={styles.submitButton}
          onPress={() => void onSubmit()}
          disabled={!canManage}
        />
      }
    >
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Customer</Text>
        <Dropdown
          value={form.customerRemoteId}
          options={customerOptions}
          onChange={(value) => onChange("customerRemoteId", value)}
          placeholder="Customer name"
          modalTitle="Select customer"
          showLeadingIcon={false}
        />
      </View>

      <LabeledTextInput
        label="Phone"
        value={selectedCustomerPhone}
        placeholder="Phone number"
        editable={false}
      />

      <View style={styles.itemsHeaderRow}>
        <Text style={styles.fieldLabel}>Items</Text>
      </View>

      <View style={styles.itemsWrap}>
        {lineItems.map((item) => {
          const salePriceAmount = productPriceByRemoteId[item.productRemoteId] ?? 0;

          return (
            <View key={item.remoteId} style={styles.itemRow}>
              <View style={styles.itemNameWrap}>
                <Dropdown
                  value={item.productRemoteId}
                  options={productOptions}
                  onChange={(value) =>
                    onLineItemChange(item.remoteId, "productRemoteId", value)
                  }
                  placeholder="Item name"
                  modalTitle="Select item"
                  showLeadingIcon={false}
                />
              </View>
              <LabeledTextInput
                label=""
                value={item.quantity}
                onChangeText={(value) =>
                  onLineItemChange(item.remoteId, "quantity", value)
                }
                keyboardType="decimal-pad"
                placeholder="1"
                containerStyle={styles.quantityWrap}
                inputStyle={styles.centeredInput}
              />
              <LabeledTextInput
                label=""
                value={formatCompactAmount(salePriceAmount)}
                editable={false}
                containerStyle={styles.priceWrap}
                inputStyle={styles.centeredInput}
              />
              {lineItems.length > 1 ? (
                <Pressable
                  style={styles.removeItemIconButton}
                  onPress={() => onRemoveLineItem(item.remoteId)}
                >
                  <Trash2 size={14} color={colors.destructive} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable style={styles.addItemButton} onPress={onAddLineItem} disabled={!canManage}>
        <Plus size={14} color={colors.success} />
        <Text style={styles.addItemText}>Add Item</Text>
      </Pressable>

      <View style={styles.twoColumnGrid}>
        <LabeledTextInput label="Discount" value="0" editable={false} />
        <LabeledTextInput
          label="Paid Amount"
          value={formatCompactAmount(formPricingPreview.paidAmount)}
          editable={false}
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Payment Method</Text>
        <Dropdown
          value={form.tags}
          options={paymentMethodOptions}
          onChange={(value) => onChange("tags", value)}
          placeholder="Select payment method"
          modalTitle="Select payment method"
          showLeadingIcon={false}
        />
      </View>

      <LabeledTextInput
        label="Notes"
        value={form.notes}
        onChangeText={(value) => onChange("notes", value)}
        placeholder="Order notes..."
        multiline
      />

      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formPricingPreview.subtotalLabel}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({formPricingPreview.taxRateLabel})</Text>
          <Text style={styles.totalValue}>{formPricingPreview.taxLabel}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount</Text>
          <Text style={styles.discountValue}>-{formPricingPreview.discountLabel}</Text>
        </View>
        <View style={styles.totalDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.finalTotalLabel}>Total</Text>
          <Text style={styles.finalTotalValue}>{formPricingPreview.totalLabel}</Text>
        </View>
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  submitButton: {
    width: "100%",
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  itemsHeaderRow: {
    marginTop: spacing.xs,
  },
  itemsWrap: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  itemNameWrap: {
    flex: 1,
  },
  quantityWrap: {
    width: 58,
  },
  priceWrap: {
    width: 66,
  },
  centeredInput: {
    textAlign: "center",
    paddingHorizontal: spacing.xs,
  },
  removeItemIconButton: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  addItemButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addItemText: {
    color: colors.success,
    fontSize: 14,
    fontFamily: "InterSemiBold",
  },
  twoColumnGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  totalCard: {
    borderWidth: 1,
    borderColor: "rgba(31, 99, 64, 0.08)",
    backgroundColor: "#EAF4EF",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  totalLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
  totalValue: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterMedium",
  },
  discountValue: {
    color: colors.success,
    fontSize: 14,
    fontFamily: "InterSemiBold",
  },
  totalDivider: {
    marginTop: 2,
    marginBottom: 2,
    height: 1,
    backgroundColor: colors.border,
  },
  finalTotalLabel: {
    color: colors.cardForeground,
    fontSize: 15,
    fontFamily: "InterBold",
  },
  finalTotalValue: {
    color: colors.cardForeground,
    fontSize: 22,
    fontFamily: "InterBold",
  },
});
