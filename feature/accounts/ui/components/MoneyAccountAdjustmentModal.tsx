import React from "react";
import { StyleSheet, Text } from "react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { FormModalActionFooter } from "@/shared/components/reusable/Form/FormModalActionFooter";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { colors } from "@/shared/components/theme/colors";
import { spacing } from "@/shared/components/theme/spacing";
import { MoneyAccountsViewModel } from "@/feature/accounts/viewModel/moneyAccounts.viewModel";

type MoneyAccountAdjustmentModalProps = {
  viewModel: MoneyAccountsViewModel;
};

export function MoneyAccountAdjustmentModal({
  viewModel,
}: MoneyAccountAdjustmentModalProps): React.ReactElement {
  return (
    <FormSheetModal
      visible={viewModel.isAdjustmentModalVisible}
      title="Correct Balance"
      subtitle={viewModel.adjustmentForm.accountName}
      onClose={viewModel.onCloseAdjustment}
      closeAccessibilityLabel="Close balance correction"
      contentContainerStyle={styles.content}
      footer={
        <FormModalActionFooter>
          <AppButton
            label="Cancel"
            variant="secondary"
            size="lg"
            style={styles.actionButton}
            onPress={viewModel.onCloseAdjustment}
            disabled={viewModel.adjustmentForm.isSaving}
          />
          <AppButton
            label={
              viewModel.adjustmentForm.isSaving
                ? "Saving..."
                : "Apply Correction"
            }
            variant="primary"
            size="lg"
            style={styles.actionButton}
            onPress={() => void viewModel.onSubmitAdjustment()}
            disabled={
              !viewModel.canManage || viewModel.adjustmentForm.isSaving
            }
          />
        </FormModalActionFooter>
      }
    >
      <LabeledTextInput
        label="Current Balance"
        value={viewModel.adjustmentForm.currentBalanceLabel}
        editable={false}
      />

      <LabeledTextInput
        label={`Actual Balance (${viewModel.currencyLabel}) *`}
        value={viewModel.adjustmentForm.targetBalance}
        onChangeText={(value) =>
          viewModel.onAdjustmentFormChange("targetBalance", value)
        }
        placeholder="0"
        keyboardType="decimal-pad"
        helperText="Enter the cash, bank, or wallet balance you counted."
        errorText={viewModel.adjustmentForm.fieldErrors.targetBalance}
      />

      <LabeledTextInput
        label="Reason *"
        value={viewModel.adjustmentForm.reason}
        onChangeText={(value) =>
          viewModel.onAdjustmentFormChange("reason", value)
        }
        placeholder="Example: cash counted at closing"
        errorText={viewModel.adjustmentForm.fieldErrors.reason}
      />

      {viewModel.adjustmentForm.errorMessage ? (
        <Text style={styles.errorText}>
          {viewModel.adjustmentForm.errorMessage}
        </Text>
      ) : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterSemiBold",
  },
  actionButton: {
    flex: 1,
  },
});
