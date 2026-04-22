import {
  OrderMoneyActionValue,
  OrderMoneyFormState,
} from "@/feature/orders/types/order.state.types";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import {
  Dropdown,
  DropdownOption,
} from "@/shared/components/reusable/DropDown/Dropdown";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/components/theme/colors";

type Props = {
  form: OrderMoneyFormState;
  moneyAccountOptions: DropdownOption[];
  onClose: () => void;
  onChange: (
    field: keyof Omit<OrderMoneyFormState, "visible" | "action" | "fieldErrors">,
    value: string,
  ) => void;
  onSubmit: () => Promise<void>;
};

const getTitle = (action: OrderMoneyActionValue): string =>
  action === "payment" ? "Record Order Payment" : "Order Refund";

const getSubmitLabel = (action: OrderMoneyActionValue): string =>
  action === "payment" ? "Record Payment" : "Save Refund";

export function OrderMoneyActionModal({
  form,
  moneyAccountOptions,
  onClose,
  onChange,
  onSubmit,
}: Props) {
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
        label="Amount *"
        value={form.amount}
        onChangeText={(value) => onChange("amount", value)}
        keyboardType="decimal-pad"
        placeholder="Enter amount"
        errorText={form.fieldErrors.amount}
      />
      <LabeledTextInput
        label="Date *"
        value={form.happenedAt}
        onChangeText={(value) => onChange("happenedAt", value)}
        placeholder="YYYY-MM-DD"
        errorText={form.fieldErrors.happenedAt}
      />

      <Text style={styles.label}>Money Account *</Text>
      <Dropdown
        value={form.settlementMoneyAccountRemoteId}
        options={moneyAccountOptions}
        onChange={(value) => onChange("settlementMoneyAccountRemoteId", value)}
        placeholder="Select money account"
        modalTitle="Select money account"
        showLeadingIcon={false}
      />
      {form.fieldErrors.settlementMoneyAccountRemoteId ? (
        <Text style={styles.errorText}>
          {form.fieldErrors.settlementMoneyAccountRemoteId}
        </Text>
      ) : null}

      <LabeledTextInput
        label="Note"
        value={form.note}
        onChangeText={(value) => onChange("note", value)}
        placeholder="Optional note"
        multiline
      />

      <View style={styles.actionRow}>
        <AppButton
          label="Cancel"
          variant="secondary"
          style={styles.actionButton}
          onPress={onClose}
        />
        <AppButton
          label={getSubmitLabel(form.action)}
          style={styles.actionButton}
          onPress={() => void onSubmit()}
        />
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: -4,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterMedium",
    marginTop: -2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
