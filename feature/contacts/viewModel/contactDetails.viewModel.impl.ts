import { Contact } from "@/feature/contacts/types/contact.types";
import {
  ContactDetailSummaryCardState,
  ContactDetailTimelineItemState,
} from "@/feature/contacts/types/contactDetails.state.types";
import { GetContactByRemoteIdUseCase } from "@/feature/contacts/useCase/getContactByRemoteId.useCase";
import {
  ContactHistoryAmountTone,
  ContactHistoryEventType,
  ContactHistoryEventTypeValue,
  ContactHistoryTimelineItem,
} from "@/readModel/contactHistory/types/contactHistory.readModel.types";
import { GetContactHistoryReadModelUseCase } from "@/readModel/contactHistory/useCase/getContactHistoryReadModel.useCase";
import { formatCurrencyAmount } from "@/shared/utils/currency/accountCurrency";
import { useCallback, useMemo, useRef, useState } from "react";
import { ContactDetailsViewModel } from "./contactDetails.viewModel";

type UseContactDetailsViewModelParams = {
  accountRemoteId: string | null;
  currencyCode: string | null;
  countryCode: string | null;
  getContactByRemoteIdUseCase: GetContactByRemoteIdUseCase;
  getContactHistoryReadModelUseCase: GetContactHistoryReadModelUseCase;
};

const formatStatusLabel = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatOccurredAtLabel = (occurredAt: number): string => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(occurredAt));
};

const buildEventLabel = (eventType: ContactHistoryEventTypeValue): string => {
  switch (eventType) {
    case ContactHistoryEventType.Transaction:
      return "Transaction";
    case ContactHistoryEventType.BillingDocument:
      return "Billing";
    case ContactHistoryEventType.LedgerEntry:
      return "Ledger";
    case ContactHistoryEventType.Order:
      return "Order";
    case ContactHistoryEventType.PosSale:
      return "POS";
    default:
      return "Activity";
  }
};

const buildSummaryCards = (params: {
  totalMoneyIn: number;
  totalMoneyOut: number;
  openBillingDocumentCount: number;
  ledgerEntryCount: number;
  orderCount: number;
  posSaleCount: number;
  currencyCode: string | null;
  countryCode: string | null;
}): readonly ContactDetailSummaryCardState[] => [
  {
    id: "money-in",
    label: "Money In",
    value: formatCurrencyAmount({
      amount: params.totalMoneyIn,
      currencyCode: params.currencyCode,
      countryCode: params.countryCode,
      maximumFractionDigits: 0,
    }),
    tone: "positive",
  },
  {
    id: "money-out",
    label: "Money Out",
    value: formatCurrencyAmount({
      amount: params.totalMoneyOut,
      currencyCode: params.currencyCode,
      countryCode: params.countryCode,
      maximumFractionDigits: 0,
    }),
    tone: "negative",
  },
  {
    id: "open-docs",
    label: "Open Docs",
    value: `${params.openBillingDocumentCount}`,
    tone: "neutral",
  },
  {
    id: "ledger",
    label: "Ledger",
    value: `${params.ledgerEntryCount}`,
    tone: "neutral",
  },
  {
    id: "orders",
    label: "Orders",
    value: `${params.orderCount}`,
    tone: "neutral",
  },
  {
    id: "pos-sales",
    label: "POS Sales",
    value: `${params.posSaleCount}`,
    tone: "neutral",
  },
];

const buildTimelineItems = (params: {
  timelineItems: readonly ContactHistoryTimelineItem[];
  currencyCode: string | null;
  countryCode: string | null;
}): readonly ContactDetailTimelineItemState[] =>
  params.timelineItems.map((item) => ({
    id: item.id,
    eventLabel: buildEventLabel(item.eventType),
    title: item.title,
    subtitle: item.subtitle,
    happenedAtLabel: formatOccurredAtLabel(item.occurredAt),
    amountLabel:
      item.amount === null
        ? null
        : `${
            item.amountTone === ContactHistoryAmountTone.Negative ? "-" : ""
          }${formatCurrencyAmount({
            amount: Math.abs(item.amount),
            currencyCode: params.currencyCode,
            countryCode: params.countryCode,
            maximumFractionDigits: 0,
          })}`,
    amountTone:
      item.amountTone === ContactHistoryAmountTone.Positive
        ? "positive"
        : item.amountTone === ContactHistoryAmountTone.Negative
          ? "negative"
          : "neutral",
    statusLabel: formatStatusLabel(item.statusLabel),
  }));

export const useContactDetailsViewModel = ({
  accountRemoteId,
  currencyCode,
  countryCode,
  getContactByRemoteIdUseCase,
  getContactHistoryReadModelUseCase,
}: UseContactDetailsViewModelParams): ContactDetailsViewModel => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emptyStateMessage, setEmptyStateMessage] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [summaryCards, setSummaryCards] = useState<
    readonly ContactDetailSummaryCardState[]
  >([]);
  const [timelineItems, setTimelineItems] = useState<
    readonly ContactDetailTimelineItemState[]
  >([]);

  const activeRequestRef = useRef(0);

  const resetState = useCallback(() => {
    activeRequestRef.current += 1;
    setIsVisible(false);
    setIsLoading(false);
    setErrorMessage(null);
    setEmptyStateMessage(null);
    setSelectedContact(null);
    setSummaryCards([]);
    setTimelineItems([]);
  }, []);

  const loadDetails = useCallback(
    async (contactRemoteId: string) => {
      if (!accountRemoteId) {
        setIsLoading(false);
        setErrorMessage("An active account is required to load contact details.");
        setSummaryCards([]);
        setTimelineItems([]);
        setEmptyStateMessage(null);
        return;
      }

      const requestId = activeRequestRef.current + 1;
      activeRequestRef.current = requestId;

      setIsLoading(true);
      setErrorMessage(null);
      setEmptyStateMessage(null);
      setSummaryCards([]);
      setTimelineItems([]);

      const contactResult = await getContactByRemoteIdUseCase.execute({
        accountRemoteId,
        remoteId: contactRemoteId,
      });

      if (requestId !== activeRequestRef.current) {
        return;
      }

      if (!contactResult.success) {
        setIsLoading(false);
        setErrorMessage(contactResult.error.message);
        return;
      }

      setSelectedContact(contactResult.value);

      const historyResult = await getContactHistoryReadModelUseCase.execute({
        accountRemoteId,
        contactRemoteId,
        timelineLimit: 50,
      });

      if (requestId !== activeRequestRef.current) {
        return;
      }

      if (!historyResult.success) {
        setIsLoading(false);
        setErrorMessage(historyResult.error.message);
        return;
      }

      setSummaryCards(
        buildSummaryCards({
          ...historyResult.value.summary,
          currencyCode,
          countryCode,
        }),
      );

      const nextTimelineItems = buildTimelineItems({
        timelineItems: historyResult.value.timelineItems,
        currencyCode,
        countryCode,
      });

      setTimelineItems(nextTimelineItems);
      setEmptyStateMessage(
        nextTimelineItems.length === 0
          ? "No linked business activity yet for this contact."
          : null,
      );
      setIsLoading(false);
    },
    [
      accountRemoteId,
      countryCode,
      currencyCode,
      getContactByRemoteIdUseCase,
      getContactHistoryReadModelUseCase,
    ],
  );

  const onOpenDetails = useCallback(
    async (contact: Contact) => {
      setSelectedContact(contact);
      setIsVisible(true);
      await loadDetails(contact.remoteId);
    },
    [loadDetails],
  );

  const onCloseDetails = useCallback(() => {
    resetState();
  }, [resetState]);

  return useMemo<ContactDetailsViewModel>(
    () => ({
      isVisible,
      isLoading,
      errorMessage,
      emptyStateMessage,
      selectedContact,
      summaryCards,
      timelineItems,
      onOpenDetails,
      onCloseDetails,
    }),
    [
      emptyStateMessage,
      errorMessage,
      isLoading,
      isVisible,
      onCloseDetails,
      onOpenDetails,
      selectedContact,
      summaryCards,
      timelineItems,
    ],
  );
};
