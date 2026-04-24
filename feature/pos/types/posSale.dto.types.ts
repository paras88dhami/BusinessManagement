import type { PosReceipt } from "@/feature/pos/types/pos.entity.types";
import type { PosSaleRecord } from "./posSale.entity.types";
import type { PosSaleWorkflowStatusValue } from "./posSale.constant";

export type CreatePosSaleRecordParams = Omit<
  PosSaleRecord,
  "createdAt" | "updatedAt"
>;

export type GetPosSaleByIdempotencyKeyParams = {
  businessAccountRemoteId: string;
  idempotencyKey: string;
};

export type GetPosSalesParams = {
  businessAccountRemoteId: string;
  workflowStatus?: PosSaleWorkflowStatusValue;
};

export type UpdatePosSaleWorkflowStateParams = {
  saleRemoteId: string;
  workflowStatus: PosSaleWorkflowStatusValue;
  receipt: PosReceipt | null;
  billingDocumentRemoteId: string | null;
  ledgerEntryRemoteId: string | null;
  postedTransactionRemoteIds: readonly string[];
  lastErrorType: string | null;
  lastErrorMessage: string | null;
};
