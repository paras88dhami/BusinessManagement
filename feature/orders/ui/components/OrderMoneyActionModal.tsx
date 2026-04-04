import {
  OrderMoneyActionValue,
  OrderMoneyFormState,
} from "@/feature/orders/viewModel/orders.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  form: OrderMoneyFormState;
  onClose: () => void;
  onChange: (field: keyof Omit<OrderMoneyFormState, "visible" | "action">, value: string) => void;
  onSubmit: () => Promise<void>;
};

const getTitle = (action: OrderMoneyActionValue): string =>
  action === "payment" ? "Record Order Payment" : "Order Refund";

const getSubmitLabel = (action: OrderMoneyActionValue): string =>
  action === "payment" ? "Record Payment" : "Save Refund";

export function OrderMoneyActionModal({ form, onClose, onChange, onSubmit }: Props) {
  return (
    <FormSheetModal
      visible={form.visible}
      title={getTitle(form.action)}
      subtitle={form.orderNumber ? `Order ${form.orderNumber}` : undefined}
      onClose={onClose}
      presentation="dialog"
      contentContainerStyle={styles.content}
    >
      <LabeledTextInput
        label="Amount"
        value={form.amount}
        onChangeText={(value) => onChange("amount", value)}
        keyboardType="decimal-pad"
        placeholder="Enter amount"
      />
      <LabeledTextInput
        label="Date"
        value={form.happenedAt}
        onChangeText={(value) => onChange("happenedAt", value)}
        placeholder="YYYY-MM-DD"
      />
      <LabeledTextInput
        label="Note"
        value={form.note}
        onChangeText={(value) => onChange("note", value)}
        placeholder="Optional note"
        multiline
      />
      <View style={styles.actionRow}>
        <AppButton label="Cancel" variant="secondary" style={styles.actionButton} onPress={onClose} />
        <AppButton label={getSubmitLabel(form.action)} style={styles.actionButton} onPress={() => void onSubmit()} />
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
