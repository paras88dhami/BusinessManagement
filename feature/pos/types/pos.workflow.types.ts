export type PosCheckoutMode = "payment" | "split-bill";

export type PosCheckoutSubmissionKind = "payment" | "split-bill";

export type PosModalType =
  | "none"
  | "create-product"
  | "discount"
  | "surcharge"
  | "payment"
  | "split-bill"
  | "receipt"
  | "customer-create"
  | "sale-history"
  | "sale-history-detail";

export type PosCheckoutWorkflowState = {
  isSubmitting: boolean;
  submissionKind: PosCheckoutSubmissionKind | null;
};

export type PosSplitBillWorkflowResult = {
  allocatedAmount: number;
  remainingAmount: number;
  errorMessage: string | null;
};
