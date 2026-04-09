import { OrderStatusValue } from "@/feature/orders/types/order.types";
import { DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { CheckCircle2 } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
      title="Change Status"
      onClose={onClose}
      presentation="dialog"
      contentContainerStyle={styles.content}
      scrollEnabled={false}
    >
      <View style={styles.optionList}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              style={[styles.optionRow, isSelected ? styles.optionRowSelected : null]}
              onPress={() => {
                onChange(option.value as OrderStatusValue);
                if (!isSelected) {
                  void onSubmit();
                }
              }}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected ? styles.optionLabelSelected : null,
                ]}
              >
                {option.label}
              </Text>
              {isSelected ? (
                <CheckCircle2 size={16} color={colors.primaryForeground} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  optionRowSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionLabel: {
    color: colors.cardForeground,
    fontSize: 17,
    fontFamily: "InterSemiBold",
  },
  optionLabelSelected: {
    color: colors.primaryForeground,
    fontFamily: "InterBold",
  },
});
