import type { BillingDocument } from "@/feature/billing/types/billing.types";
import type { PosReceipt } from "./pos.entity.types";
import type { PosSaleRecord } from "./posSale.entity.types";
import type { PosSaleWorkflowStatusValue } from "./posSale.constant";

export const PosArtifactReconciliationStatus = {
  NotRecorded: "not_recorded",
  Present: "present",
  Missing: "missing",
  RecordedOnly: "recorded_only",
} as const;

export type PosArtifactReconciliationStatusValue =
  (typeof PosArtifactReconciliationStatus)[keyof typeof PosArtifactReconciliationStatus];

export type PosArtifactReconciliationItem = {
  label: string;
  remoteId: string | null;
  status: PosArtifactReconciliationStatusValue;
  detail: string;
};

export type PosArtifactReconciliationRefs = {
  remoteIds: readonly string[];
  status: PosArtifactReconciliationStatusValue;
  detail: string;
};

export type PosSaleReconciliation = {
  inventoryMovements: PosArtifactReconciliationRefs;
  billingDocument: PosArtifactReconciliationItem;
  ledgerEntry: PosArtifactReconciliationItem;
  transactionRefs: PosArtifactReconciliationRefs;
  hasUnresolvedArtifacts: boolean;
  canRunCleanup: boolean;
  checkedAt: number;
};

export type PosSaleHistoryItem = {
  sale: PosSaleRecord;
  document: BillingDocument;
  receipt: PosReceipt;
  workflowStatus: PosSaleWorkflowStatusValue;
  lastErrorMessage: string | null;
};
