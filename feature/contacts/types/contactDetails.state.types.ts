export type ContactDetailTone = "positive" | "negative" | "neutral";

export type ContactDetailSummaryCardState = {
  id: string;
  label: string;
  value: string;
  tone: ContactDetailTone;
};

export type ContactDetailTimelineItemState = {
  id: string;
  eventLabel: string;
  title: string;
  subtitle: string | null;
  happenedAtLabel: string;
  amountLabel: string | null;
  amountTone: ContactDetailTone;
  statusLabel: string | null;
};

export type ContactDetailsScreenState = {
  isVisible: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  emptyStateMessage: string | null;
  summaryCards: readonly ContactDetailSummaryCardState[];
  timelineItems: readonly ContactDetailTimelineItemState[];
};
