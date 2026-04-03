import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar, X } from "lucide-react-native";
import { Dropdown } from "@/shared/components/reusable/DropDown/Dropdown";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { AppTextInput } from "@/shared/components/reusable/Form/AppTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import {
  InventoryAdjustmentReasonValue,
  InventoryMovementType,
  InventoryMovementTypeValue,
} from "@/feature/inventory/types/inventory.types";
import { InventoryMovementFormState } from "@/feature/inventory/viewModel/inventory.viewModel";

type Props = {
  visible: boolean;
  editorType: InventoryMovementTypeValue;
  title: string;
  form: InventoryMovementFormState;
  productOptions: { label: string; value: string }[];
  adjustmentReasonOptions: readonly { label: string; value: InventoryAdjustmentReasonValue }[];
  onClose: () => void;
  onChange: (field: keyof InventoryMovementFormState, value: string) => void;
  onSubmit: () => Promise<void>;
};

export function InventoryMovementModal({
  visible,
  editorType,
  title,
  form,
  productOptions,
  adjustmentReasonOptions,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.formWrap} showsVerticalScrollIndicator={false}>
            <Dropdown
              value={form.productRemoteId}
              options={productOptions}
              onChange={(value) => onChange("productRemoteId", value)}
              placeholder="Select Product *"
              modalTitle="Select product"
              showLeadingIcon={false}
              triggerStyle={styles.dropdownTrigger}
              triggerTextStyle={styles.dropdownText}
            />
            <View style={styles.doubleRow}>
              <AppTextInput
                value={form.quantity}
                placeholder="Quantity *"
                keyboardType="decimal-pad"
                onChangeText={(value) => onChange("quantity", value)}
                containerStyle={styles.flexOne}
              />
              <AppTextInput
                value={form.unitRate}
                placeholder="Rate (NPR)"
                keyboardType="decimal-pad"
                onChangeText={(value) => onChange("unitRate", value)}
                containerStyle={styles.flexOne}
              />
            </View>
            {editorType === InventoryMovementType.Adjustment ? (
              <Dropdown
                value={form.reason}
                options={adjustmentReasonOptions.map((item) => ({ label: item.label, value: item.value }))}
                onChange={(value) => onChange("reason", value)}
                placeholder="Select reason"
                modalTitle="Select adjustment reason"
                showLeadingIcon={false}
                triggerStyle={styles.dropdownTrigger}
                triggerTextStyle={styles.dropdownText}
              />
            ) : null}
            <AppTextInput
              value={form.movementDate}
              placeholder="yyyy-mm-dd"
              onChangeText={(value) => onChange("movementDate", value)}
              rightIcon={<Calendar size={18} color={colors.mutedForeground} />}
            />
            <AppTextInput
              value={form.remark}
              placeholder="Remarks"
              onChangeText={(value) => onChange("remark", value)}
              multiline
              numberOfLines={4}
              style={styles.multilineInput}
            />
            <AppButton
              label={editorType === InventoryMovementType.StockIn ? "Save" : "Save"}
              size="lg"
              onPress={() => {
                void onSubmit();
              }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "82%",
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  formWrap: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  dropdownTrigger: {
    minHeight: 54,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "InterMedium",
    color: colors.cardForeground,
  },
  doubleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flexOne: {
    flex: 1,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});
