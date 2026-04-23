import {
  Contact,
  ContactBalanceDirection,
  getContactTypeLabel,
} from "@/feature/contacts/types/contact.types";
import {
  ContactDetailSummaryCardState,
  ContactDetailTimelineItemState,
} from "@/feature/contacts/types/contactDetails.state.types";
import { AppButton } from "@/shared/components/reusable/Buttons/AppButton";
import { Card } from "@/shared/components/reusable/Cards/Card";
import { FormModalActionFooter } from "@/shared/components/reusable/Form/FormModalActionFooter";
import { FormSheetModal } from "@/shared/components/reusable/Form/FormSheetModal";
import { colors } from "@/shared/components/theme/colors";
import { radius, spacing } from "@/shared/components/theme/spacing";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  emptyStateMessage: string | null;
  selectedContact: Contact | null;
  summaryCards: readonly ContactDetailSummaryCardState[];
  timelineItems: readonly ContactDetailTimelineItemState[];
  currencyPrefix: string;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
};

const formatPlainAmount = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);

const buildOpeningBalanceLabel = (
  contact: Contact,
  currencyPrefix: string,
): string | null => {
  if (contact.openingBalanceAmount <= 0) {
    return null;
  }

  const amountLabel = `${currencyPrefix} ${formatPlainAmount(
    contact.openingBalanceAmount,
  )}`;

  if (contact.openingBalanceDirection === ContactBalanceDirection.Receive) {
    return `${amountLabel} • To Receive`;
  }

  if (contact.openingBalanceDirection === ContactBalanceDirection.Pay) {
    return `${amountLabel} • To Pay`;
  }

  return amountLabel;
};

const getSummaryToneColor = (
  tone: ContactDetailSummaryCardState["tone"],
): string => {
  if (tone === "positive") {
    return colors.success;
  }

  if (tone === "negative") {
    return colors.destructive;
  }

  return colors.cardForeground;
};

const getTimelineAmountColor = (
  tone: ContactDetailTimelineItemState["amountTone"],
): string => {
  if (tone === "positive") {
    return colors.success;
  }

  if (tone === "negative") {
    return colors.destructive;
  }

  return colors.cardForeground;
};

export function ContactDetailsModal({
  visible,
  isLoading,
  errorMessage,
  emptyStateMessage,
  selectedContact,
  summaryCards,
  timelineItems,
  currencyPrefix,
  canManage,
  onClose,
  onEdit,
}: Props): React.ReactElement {
  const openingBalanceLabel = selectedContact
    ? buildOpeningBalanceLabel(selectedContact, currencyPrefix)
    : null;

  return (
    <FormSheetModal
      visible={visible}
      title={selectedContact?.fullName ?? "Contact Details"}
      subtitle="Linked billing, money, ledger, order, and POS history"
      onClose={onClose}
      closeAccessibilityLabel="Close contact details"
      presentation="bottom-sheet"
      footer={
        <FormModalActionFooter>
          <AppButton
            label="Close"
            variant="secondary"
            size="lg"
            style={styles.footerButton}
            onPress={onClose}
          />
          {canManage ? (
            <AppButton
              label="Edit Contact"
              size="lg"
              style={styles.footerButton}
              onPress={onEdit}
              disabled={!selectedContact}
            />
          ) : null}
        </FormModalActionFooter>
      }
    >
      {selectedContact ? (
        <Card>
          <View style={styles.headerTopRow}>
            <Text style={styles.contactName}>{selectedContact.fullName}</Text>
            {selectedContact.isArchived ? (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>Archived</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.contactType}>
            {getContactTypeLabel(selectedContact.contactType)}
          </Text>

          <View style={styles.contactInfoGroup}>
            {selectedContact.phoneNumber ? (
              <Text style={styles.contactInfoLine}>
                Phone: {selectedContact.phoneNumber}
              </Text>
            ) : null}
            {selectedContact.emailAddress ? (
              <Text style={styles.contactInfoLine}>
                Email: {selectedContact.emailAddress}
              </Text>
            ) : null}
            {selectedContact.address ? (
              <Text style={styles.contactInfoLine}>
                Address: {selectedContact.address}
              </Text>
            ) : null}
            {selectedContact.taxId ? (
              <Text style={styles.contactInfoLine}>
                Tax ID: {selectedContact.taxId}
              </Text>
            ) : null}
            {openingBalanceLabel ? (
              <Text style={styles.contactInfoLine}>
                Opening Balance: {openingBalanceLabel}
              </Text>
            ) : null}
            {selectedContact.notes ? (
              <Text style={styles.contactInfoLine}>
                Notes: {selectedContact.notes}
              </Text>
            ) : null}
          </View>
        </Card>
      ) : null}

      <View style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <Card key={card.id} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{card.label}</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: getSummaryToneColor(card.tone) },
              ]}
            >
              {card.value}
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>History</Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {errorMessage ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load linked history</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </Card>
        ) : null}

        {!isLoading && !errorMessage && emptyStateMessage ? (
          <Card>
            <Text style={styles.emptyText}>{emptyStateMessage}</Text>
          </Card>
        ) : null}

        {!isLoading && !errorMessage
          ? timelineItems.map((item) => (
              <Card key={item.id} style={styles.timelineCard}>
                <View style={styles.timelineHeaderRow}>
                  <View style={styles.eventBadge}>
                    <Text style={styles.eventBadgeText}>{item.eventLabel}</Text>
                  </View>
                  <Text style={styles.happenedAtText}>{item.happenedAtLabel}</Text>
                </View>

                <View style={styles.timelineBodyRow}>
                  <View style={styles.timelineTextWrap}>
                    <Text style={styles.timelineTitle}>{item.title}</Text>
                    {item.subtitle ? (
                      <Text style={styles.timelineSubtitle}>{item.subtitle}</Text>
                    ) : null}
                    {item.statusLabel ? (
                      <Text style={styles.timelineStatus}>
                        Status: {item.statusLabel}
                      </Text>
                    ) : null}
                  </View>

                  {item.amountLabel ? (
                    <Text
                      style={[
                        styles.timelineAmount,
                        { color: getTimelineAmountColor(item.amountTone) },
                      ]}
                    >
                      {item.amountLabel}
                    </Text>
                  ) : null}
                </View>
              </Card>
            ))
          : null}
      </View>
    </FormSheetModal>
  );
}

const styles = StyleSheet.create({
  footerButton: {
    flex: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  contactName: {
    flex: 1,
    color: colors.cardForeground,
    fontSize: 18,
    fontFamily: "InterBold",
  },
  archivedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  archivedBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "InterBold",
  },
  contactType: {
    marginTop: spacing.xs,
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
  contactInfoGroup: {
    marginTop: spacing.sm,
    gap: 6,
  },
  contactInfoLine: {
    color: colors.cardForeground,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryCard: {
    width: "47%",
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: "InterBold",
  },
  sectionWrap: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontFamily: "InterBold",
  },
  loadingWrap: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  errorCard: {
    backgroundColor: "#FFF6F6",
    borderColor: "#F4D0D0",
  },
  errorTitle: {
    color: colors.destructive,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  errorMessage: {
    marginTop: 6,
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: "InterMedium",
  },
  timelineCard: {
    gap: spacing.sm,
  },
  timelineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  eventBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignSelf: "flex-start",
  },
  eventBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: "InterBold",
  },
  happenedAtText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  timelineBodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  timelineTextWrap: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontFamily: "InterBold",
  },
  timelineSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  timelineStatus: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  timelineAmount: {
    fontSize: 13,
    fontFamily: "InterBold",
  },
});
