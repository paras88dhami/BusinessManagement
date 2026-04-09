import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Link2, Paperclip, Trash2 } from "lucide-react-native";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { ChipSelectorField } from "@/shared/components/reusable/Form/ChipSelectorField";
import { FormModalActionFooter } from "@/shared/components/reusable/Form/FormModalActionFooter";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import {
  Dropdown,
  DropdownOption,
} from "@/shared/components/reusable/DropDown/Dropdown";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { LedgerEditorViewModel } from "@/feature/ledger/viewModel/ledgerEditor.viewModel";
import {
  getLedgerPartyLabel,
  getLedgerEntryTypeLabel,
  requiresDueDate,
  requiresPaymentMode,
} from "@/feature/ledger/viewModel/ledger.shared";

type LedgerEntryEditorModalProps = {
  viewModel: LedgerEditorViewModel;
};

export function LedgerEntryEditorModal({
  viewModel,
}: LedgerEntryEditorModalProps) {
  const { state } = viewModel;

  const paymentModeOptions: DropdownOption[] = viewModel.availablePaymentModes.map((mode) => ({
    label: mode.label,
    value: mode.value,
  }));

  const title = state.mode === "create" ? "New Ledger Entry" : "Edit Ledger Entry";
  const partyLabel = getLedgerPartyLabel(state.entryType);
  const actionLabel = getLedgerEntryTypeLabel(state.entryType);
  const shouldShowDueDate = requiresDueDate(state.entryType);
  const shouldShowPaymentMode = requiresPaymentMode(state.entryType);

  return (
    <FormSheetModal
      visible={state.visible}
      title={title}
      subtitle="Quick entry for dues and payments"
      onClose={viewModel.close}
      closeAccessibilityLabel="Close ledger entry editor"
      contentContainerStyle={styles.content}
      presentation="dialog"
      footer={
        <FormModalActionFooter>
          <AppButton
            label="Cancel"
            variant="secondary"
            size="lg"
            style={styles.actionButton}
            onPress={viewModel.close}
            disabled={state.isSaving}
          />
          <AppButton
            label={state.isSaving ? "Saving..." : "Save"}
            variant="primary"
            size="lg"
            style={styles.actionButton}
            onPress={() => void viewModel.submit()}
            disabled={state.isSaving}
          />
        </FormModalActionFooter>
      }
    >
      <ChipSelectorField
        label="Action"
        options={viewModel.availableEntryTypes}
        selectedValue={state.entryType}
        onSelect={viewModel.onChangeEntryType}
        disabled={state.isSaving}
      />

      <LabeledTextInput
        label={partyLabel}
        value={state.partyName}
        onChangeText={viewModel.onChangePartyName}
        placeholder={`Enter ${partyLabel.toLowerCase()} name`}
        errorText={state.fieldErrors.partyName}
        editable={!state.isSaving}
      />

      <LabeledTextInput
        label="Amount"
        value={state.amount}
        onChangeText={viewModel.onChangeAmount}
        placeholder="Enter amount"
        keyboardType="decimal-pad"
        errorText={state.fieldErrors.amount}
        editable={!state.isSaving}
      />

      <LabeledTextInput
        label="Date"
        value={state.happenedAt}
        onChangeText={viewModel.onChangeHappenedAt}
        placeholder="YYYY-MM-DD"
        errorText={state.fieldErrors.happenedAt}
        editable={!state.isSaving}
      />

      {shouldShowDueDate ? (
        <LabeledTextInput
          label="Due Date"
          value={state.dueAt}
          onChangeText={viewModel.onChangeDueAt}
          placeholder="YYYY-MM-DD"
          errorText={state.fieldErrors.dueAt}
          editable={!state.isSaving}
        />
      ) : null}

      {shouldShowPaymentMode ? (
        <View style={styles.fieldWrap}>
          <Text style={styles.inputLabel}>Payment Mode</Text>
          <Dropdown
            value={state.paymentMode}
            options={paymentModeOptions}
            onChange={(value) => {
              const selectedMode = viewModel.availablePaymentModes.find(
                (option) => option.value === value,
              );
              viewModel.onChangePaymentMode(selectedMode?.value ?? "");
            }}
            placeholder="Select payment mode"
            modalTitle="Choose payment mode"
            showLeadingIcon={false}
            triggerStyle={styles.dropdownTrigger}
            triggerTextStyle={styles.dropdownTriggerText}
            disabled={state.isSaving}
          />
          {state.fieldErrors.paymentMode ? (
            <Text style={styles.fieldErrorText}>{state.fieldErrors.paymentMode}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Selected Action</Text>
        <Text style={styles.summaryValue}>{actionLabel}</Text>
      </View>

      <Pressable
        style={styles.moreDetailsToggle}
        onPress={viewModel.onToggleMoreDetails}
        disabled={state.isSaving}
      >
        <View>
          <Text style={styles.moreDetailsTitle}>More Details</Text>
          <Text style={styles.moreDetailsSubtitle}>Bill/ref, note, reminder, attachment</Text>
        </View>
        {state.showMoreDetails ? (
          <ChevronUp size={18} color={colors.mutedForeground} />
        ) : (
          <ChevronDown size={18} color={colors.mutedForeground} />
        )}
      </Pressable>

      {state.showMoreDetails ? (
        <View style={styles.moreDetailsContent}>
          <LabeledTextInput
            label="Bill No / Ref No"
            value={state.referenceNumber}
            onChangeText={viewModel.onChangeReferenceNumber}
            placeholder="Optional"
            editable={!state.isSaving}
          />

          <LabeledTextInput
            label="Note"
            value={state.note}
            onChangeText={viewModel.onChangeNote}
            placeholder="Optional note"
            multiline={true}
            numberOfLines={3}
            editable={!state.isSaving}
          />

          <LabeledTextInput
            label="Reminder Date"
            value={state.reminderAt}
            onChangeText={viewModel.onChangeReminderAt}
            placeholder="YYYY-MM-DD"
            errorText={state.fieldErrors.reminderAt}
            editable={!state.isSaving}
          />

          <View style={styles.attachmentWrap}>
            <Text style={styles.inputLabel}>Attachment</Text>

            {state.attachmentUri.trim().length > 0 ? (
              <View style={styles.attachmentPreview}>
                <View style={styles.attachmentMeta}>
                  <Link2 size={14} color={colors.primary} />
                  <Text style={styles.attachmentText} numberOfLines={1}>
                    {state.attachmentUri}
                  </Text>
                </View>
                <Pressable
                  style={styles.removeAttachmentButton}
                  onPress={viewModel.clearAttachment}
                  disabled={state.isSaving}
                >
                  <Trash2 size={14} color={colors.destructive} />
                </Pressable>
              </View>
            ) : null}

            <AppButton
              label={state.attachmentUri ? "Replace Attachment" : "Attach Image"}
              variant="secondary"
              size="md"
              onPress={() => void viewModel.pickAttachment()}
              disabled={state.isSaving}
              leadingIcon={<Paperclip size={14} color={colors.foreground} />}
            />
          </View>
        </View>
      ) : null}

      {state.errorMessage ? (
        <Text style={styles.errorText}>{state.errorMessage}</Text>
      ) : null}
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  fieldWrap: {
    gap: 6,
  },
  inputLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  dropdownTrigger: {
    minHeight: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    borderColor: colors.border,
  },
  dropdownTriggerText: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterMedium",
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 3,
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterSemiBold",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  moreDetailsToggle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  moreDetailsTitle: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterBold",
  },
  moreDetailsSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  moreDetailsContent: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    padding: spacing.sm,
  },
  attachmentWrap: {
    gap: spacing.xs,
  },
  attachmentPreview: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  attachmentMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attachmentText: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  removeAttachmentButton: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterSemiBold",
  },
  fieldErrorText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterSemiBold",
  },
  actionButton: {
    flex: 1,
  },
});
