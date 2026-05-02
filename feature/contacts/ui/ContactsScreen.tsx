import {
  ContactBalanceDirection,
  getContactTypeLabel,
} from "@/feature/contacts/types/contact.types";
import { ContactsViewModel } from "@/feature/contacts/viewModel/contacts.viewModel";
import { DashboardTabScaffold } from "@/feature/dashboard/shared/ui/DashboardTabScaffold";
import { buildInitials } from "@/feature/dashboard/shared/utils/dashboardNavigation.util";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { StatCard } from "@/shared/components/reusable/Cards/StatCard";
import { FilterChipGroup } from "@/shared/components/reusable/Form/FilterChipGroup";
import { SearchInputRow } from "@/shared/components/reusable/Form/SearchInputRow";
import { ConfirmDeleteModal } from "@/shared/components/reusable/Modals/ConfirmDeleteModal";
import { BottomTabAwareFooter } from "@/shared/components/reusable/ScreenLayouts/BottomTabAwareFooter";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { Plus } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ContactDetailsModal } from "./components/ContactDetailsModal";
import { ContactEditorModal } from "./components/ContactEditorModal";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
};

type ContactsScreenProps = {
  viewModel: ContactsViewModel;
};

export function ContactsScreen({
  viewModel,
}: ContactsScreenProps): React.ReactElement {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <>
      <DashboardTabScaffold
        footer={
          <BottomTabAwareFooter>
            <AppButton
              label="Add Contact"
              size="lg"
              leadingIcon={
                <Plus size={18} color={theme.colors.primaryForeground} />
              }
              onPress={viewModel.onOpenCreate}
              disabled={!viewModel.canManage}
            />
          </BottomTabAwareFooter>
        }
        baseBottomPadding={140}
        contentContainerStyle={null}
        showDivider={false}
      >
        <View style={styles.summaryRow}>
          <StatCard
            icon={<Text style={styles.statIcon}>#</Text>}
            value={String(viewModel.summary.totalCount)}
            label="Total"
          />
          <StatCard
            icon={<Text style={styles.statIcon}>+</Text>}
            value={viewModel.summary.receiveAmountLabel}
            label="Receivable"
            valueColor={theme.colors.success}
          />
          <StatCard
            icon={<Text style={styles.statIcon}>-</Text>}
            value={viewModel.summary.payAmountLabel}
            label="Payable"
            valueColor={theme.colors.destructive}
          />
        </View>

        <SearchInputRow
          value={viewModel.searchQuery}
          onChangeText={viewModel.onSearchChange}
          placeholder="Search contacts..."
        />

        <FilterChipGroup
          options={viewModel.filterOptions}
          selectedValue={viewModel.selectedFilter}
          onSelect={viewModel.onFilterChange}
        />

        {viewModel.errorMessage ? (
          <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
        ) : null}
        {viewModel.isLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}

        <Card style={styles.listCard}>
          {viewModel.filteredContacts.length === 0 ? (
            <Text style={styles.emptyText}>
              No contacts available yet. Add your first contact to get started.
            </Text>
          ) : (
            viewModel.filteredContacts.map((contact, index) => {
              const isLast = index === viewModel.filteredContacts.length - 1;
              const amountTone = viewModel.getContactAmountTone(contact);
              const amountLabel = contact.openingBalanceAmount
                ? formatAmount(contact.openingBalanceAmount)
                : null;

              return (
                <Pressable
                  key={contact.remoteId}
                  style={[styles.row, !isLast ? styles.rowBorder : null]}
                  onPress={() => {
                    void viewModel.details.onOpenDetails(contact);
                  }}
                >
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                      {buildInitials(contact.fullName).slice(0, 1)}
                    </Text>
                  </View>

                  <View style={styles.textWrap}>
                    <Text style={styles.rowTitle}>{contact.fullName}</Text>
                    <Text style={styles.rowSubtitle}>
                      {getContactTypeLabel(contact.contactType)}
                      {contact.phoneNumber ? ` - ${contact.phoneNumber}` : ""}
                    </Text>
                  </View>

                  <View style={styles.amountWrap}>
                    {amountLabel ? (
                      <>
                        <Text
                          style={[
                            styles.amountText,
                            amountTone === ContactBalanceDirection.Receive
                              ? styles.receiveValue
                              : styles.payValue,
                          ]}
                        >
                          {viewModel.currencyPrefix} {amountLabel}
                        </Text>
                        <Text style={styles.amountCaption}>
                          {amountTone === ContactBalanceDirection.Receive
                            ? "To Receive"
                            : "To Pay"}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </Card>
      </DashboardTabScaffold>

      <ContactEditorModal
        visible={viewModel.isEditorVisible}
        title={viewModel.editorTitle}
        form={viewModel.form}
        typeOptions={viewModel.typeOptions}
        onClose={viewModel.onCloseEditor}
        onChange={viewModel.onFormChange}
        onSubmit={viewModel.onSubmit}
        openingBalancePlaceholder={viewModel.openingBalancePlaceholder}
        disableSubmit={!viewModel.canManage}
        canDelete={viewModel.canManage && viewModel.editorMode === "edit"}
        isDeleting={viewModel.isDeleting}
        onDelete={viewModel.onRequestDeleteFromEditor}
      />

      <ContactDetailsModal
        visible={viewModel.details.isVisible}
        isLoading={viewModel.details.isLoading}
        errorMessage={viewModel.details.errorMessage}
        emptyStateMessage={viewModel.details.emptyStateMessage}
        selectedContact={viewModel.details.selectedContact}
        summaryCards={viewModel.details.summaryCards}
        timelineItems={viewModel.details.timelineItems}
        currencyPrefix={viewModel.currencyPrefix}
        canManage={viewModel.canManage}
        onClose={viewModel.details.onCloseDetails}
        onEdit={viewModel.onOpenEditFromDetails}
      />

      <ConfirmDeleteModal
        visible={viewModel.isDeleteModalVisible}
        title="Archive contact?"
        message={
          viewModel.pendingDeleteContactName
            ? `Archive ${viewModel.pendingDeleteContactName}? This will remove the contact from active lists but keep linked records intact.`
            : "Archive this contact? This will remove the contact from active lists but keep linked records intact."
        }
        confirmLabel="Archive"
        cancelLabel="Cancel"
        isDeleting={viewModel.isDeleting}
        errorMessage={viewModel.deleteErrorMessage}
        onCancel={viewModel.onCloseDeleteModal}
        onConfirm={() => void viewModel.onConfirmDelete()}
      />
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: theme.scaleSpace(spacing.sm),
  },
  statIcon: {
    color: theme.colors.primary,
    fontFamily: "InterBold",
    fontSize: theme.scaleText(18),
  },
  listCard: {
    paddingVertical: 0,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.sm),
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.md),
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarWrap: {
    width: theme.scaleSpace(48),
    height: theme.scaleSpace(48),
    borderRadius: radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: theme.scaleText(20),
    fontFamily: "InterBold",
  },
  textWrap: {
    flex: 1,
    gap: theme.scaleSpace(4),
  },
  rowTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(15),
    fontFamily: "InterBold",
  },
  rowSubtitle: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(13),
    fontFamily: "InterMedium",
  },
  amountWrap: {
    alignItems: "flex-end",
    minWidth: theme.scaleSpace(84),
  },
  amountText: {
    fontSize: theme.scaleText(14),
    fontFamily: "InterBold",
  },
  amountCaption: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
    marginTop: theme.scaleSpace(2),
  },
  receiveValue: {
    color: theme.colors.success,
  },
  payValue: {
    color: theme.colors.destructive,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(14),
    fontFamily: "InterMedium",
    paddingHorizontal: theme.scaleSpace(spacing.md),
    paddingVertical: theme.scaleSpace(spacing.lg),
  },
});
