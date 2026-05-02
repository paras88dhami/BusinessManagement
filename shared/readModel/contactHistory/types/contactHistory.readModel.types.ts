export const ContactHistoryEventType = {
  Transaction: "transaction",
  BillingDocument: "billing_document",
  LedgerEntry: "ledger_entry",
  Order: "order",
  PosSale: "pos_sale",
} as const;

export type ContactHistoryEventTypeValue =
  (typeof ContactHistoryEventType)[keyof typeof ContactHistoryEventType];

export const ContactHistoryAmountTone = {
  Positive: "positive",
  Negative: "negative",
  Neutral: "neutral",
} as const;

export type ContactHistoryAmountToneValue =
  (typeof ContactHistoryAmountTone)[keyof typeof ContactHistoryAmountTone];

export type ContactHistorySummary = {
  totalMoneyIn: number;
  totalMoneyOut: number;
  openBillingDocumentCount: number;
  ledgerEntryCount: number;
  orderCount: number;
  posSaleCount: number;
  timelineItemCount: number;
};

export type ContactHistoryTimelineItem = {
  id: string;
  sourceRemoteId: string;
  eventType: ContactHistoryEventTypeValue;
  title: string;
  subtitle: string | null;
  occurredAt: number;
  amount: number | null;
  amountTone: ContactHistoryAmountToneValue;
  statusLabel: string | null;
};

export type ContactHistoryReadModel = {
  accountRemoteId: string;
  contactRemoteId: string;
  summary: ContactHistorySummary;
  timelineItems: readonly ContactHistoryTimelineItem[];
};
