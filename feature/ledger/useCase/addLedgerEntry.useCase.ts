import { LedgerEntryResult, SaveLedgerEntryPayload } from "@/feature/ledger/types/ledger.entity.types";

export interface AddLedgerEntryUseCase {
  execute(payload: SaveLedgerEntryPayload): Promise<LedgerEntryResult>;
  verifyLinkedDocument(
    billingDocumentRemoteId: string,
    expectedLedgerEntryRemoteId: string,
  ): Promise<LedgerEntryResult>;
}
