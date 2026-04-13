import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { AppTextInput } from "@/shared/components/reusable/Form/AppTextInput";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type PosCustomerCreateModalProps = {
  visible: boolean;
  form: {
    fullName: string;
    phone: string;
    address: string;
  };
  onFormChange: (field: "fullName" | "phone" | "address", value: string) => void;
  onSubmit: () => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  canSubmit?: boolean;
};

export function PosCustomerCreateModal({
  visible,
  form,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting = false,
  canSubmit = false,
}: PosCustomerCreateModalProps) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <FormSheetModal
      visible={visible}
      title="Add New Customer"
      onClose={onClose}
    >
      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <AppTextInput
              value={form.fullName}
              onChangeText={(value) => onFormChange("fullName", value)}
              placeholder="Customer name"
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <AppTextInput
              value={form.phone}
              onChangeText={(value) => onFormChange("phone", value)}
              placeholder="Phone number (optional)"
              keyboardType="phone-pad"
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <AppTextInput
              value={form.address}
              onChangeText={(value) => onFormChange("address", value)}
              placeholder="Address (optional)"
              multiline
              numberOfLines={2}
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            onPress={onClose}
            disabled={isSubmitting}
            label="Cancel"
            variant="secondary"
            style={styles.cancelButton}
          />

          <AppButton
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            label={isSubmitting ? "Creating..." : "Create Customer"}
            variant="primary"
            style={styles.submitButton}
          />
        </View>
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  input: {
    minHeight: 50,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
