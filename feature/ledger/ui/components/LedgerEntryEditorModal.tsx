import {
    getLedgerEntryTypeLabel,
    getLedgerPartyLabel,
    requiresDueDate,
    requiresPaymentMode,
} from "@/feature/ledger/viewModel/ledger.shared";
import { LedgerEditorViewModel } from "@/feature/ledger/viewModel/ledgerEditor.viewModel";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import {
    DropdownOption
} from "@/shared/components/reusable/DropDown/Dropdown";
import { ChipSelectorField } from "@/shared/components/reusable/Form/ChipSelectorField";
import { DualCalendarDatePicker } from "@/shared/components/reusable/Form/DualCalendarDatePicker";
import { FormModalActionFooter } from "@/shared/components/reusable/Form/FormModalActionFooter";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { LabeledDropdownField } from "@/shared/components/reusable/Form/LabeledDropdownField";
import { LabeledTextInput } from "@/shared/components/reusable/Form/LabeledTextInput";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { ChevronDown, ChevronUp, Link2, Paperclip, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type LedgerEntryEditorModalProps = {
  viewModel: LedgerEditorViewModel;
};

export function LedgerEntryEditorModal({
  viewModel,
}: LedgerEntryEditorModalProps) {
  const { state } = viewModel;

  const settlementAccountOptions: DropdownOption[] =
    viewModel.availableSettlementAccounts.map((account) => ({
      label: account.label,
      value: account.remoteId,
    }));

  const title = state.mode === "create" ? "Quick Ledger Entry" : "Edit Ledger Entry";
  const partyLabel = getLedgerPartyLabel(state.entryType);
  const actionLabel = getLedgerEntryTypeLabel(state.entryType);
  const shouldShowDueDate = requiresDueDate(state.entryType);
  const shouldShowSettlementAccount = requiresPaymentMode(state.entryType);
  const shouldShowPartySuggestions = viewModel.partySuggestions.length > 0;
  const submitLabel =
    state.mode === "create"
      ? `Create ${actionLabel}`
      : `Update ${actionLabel}`;

  return (
    <FormSheetModal
      visible={state.visible}
      title={title}
      subtitle="Action-first entry for dues and settlements"
      onClose={viewModel.close}
      closeAccessibilityLabel="Close ledger entry editor"
      contentContainerStyle={styles.content}
      presentation="bottom-sheet"
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
            label={state.isSaving ? "Saving..." : submitLabel}
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
      {shouldShowPartySuggestions ? (
        <View style={styles.partySuggestionsWrap}>
          {viewModel.partySuggestions.map((partyName) => (
            <Pressable
              key={partyName}
              style={styles.partySuggestionButton}
              onPress={() => viewModel.onSelectPartySuggestion(partyName)}
              disabled={state.isSaving}
            >
              <Text style={styles.partySuggestionText}>{partyName}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <LabeledTextInput
        label="Amount"
        value={state.amount}
        onChangeText={viewModel.onChangeAmount}
        placeholder="Enter amount"
        keyboardType="decimal-pad"
        errorText={state.fieldErrors.amount}
        editable={!state.isSaving}
      />

      <DualCalendarDatePicker
        label="Date"
        value={state.happenedAt}
        onChangeText={viewModel.onChangeHappenedAt}
        placeholder="YYYY-MM-DD"
        errorText={state.fieldErrors.happenedAt}
        editable={!state.isSaving}
      />

      {shouldShowDueDate ? (
        <DualCalendarDatePicker
          label="Due Date"
          value={state.dueAt}
          onChangeText={viewModel.onChangeDueAt}
          placeholder="YYYY-MM-DD"
          errorText={state.fieldErrors.dueAt}
          editable={!state.isSaving}
        />
      ) : null}

      {shouldShowSettlementAccount ? (
        <LabeledDropdownField
          label="Money Account"
          value={state.settlementAccountRemoteId}
          options={settlementAccountOptions}
          onChange={viewModel.onChangeSettlementAccountRemoteId}
          placeholder="Select money account"
          modalTitle="Choose money account"
          disabled={state.isSaving}
          errorText={state.fieldErrors.settlementAccountRemoteId}
        />
      ) : null}

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

          <DualCalendarDatePicker
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
  inputLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: "InterBold",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  partySuggestionsWrap: {
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  partySuggestionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  partySuggestionText: {
    color: colors.cardForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
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
  actionButton: {
    flex: 1,
  },
});
