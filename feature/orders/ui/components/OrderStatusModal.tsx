import { OrderStatusValue } from "@/feature/orders/types/order.types";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Dropdown, DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  value: OrderStatusValue;
  options: DropdownOption[];
  onChange: (value: OrderStatusValue) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

export function OrderStatusModal({
  visible,
  value,
  options,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <FormSheetModal
      visible={visible}
      title="Change Order Status"
      subtitle="Apply the selected order status"
      onClose={onClose}
      presentation="dialog"
      contentContainerStyle={styles.content}
    >
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Status</Text>
        <Dropdown
          value={value}
          options={options}
          onChange={(nextValue) => onChange(nextValue as OrderStatusValue)}
          placeholder="Select status"
          modalTitle="Select order status"
          showLeadingIcon={false}
        />
      </View>
      <View style={styles.actionRow}>
        <AppButton label="Cancel" variant="secondary" style={styles.actionButton} onPress={onClose} />
        <AppButton label="Save Status" style={styles.actionButton} onPress={() => void onSubmit()} />
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
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
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
