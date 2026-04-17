import type { BillingDocument } from "@/feature/billing/types/billing.types";

export interface PosSaleHistoryViewModel {
  receipts: readonly BillingDocument[];
  isLoading: boolean;
  searchTerm: string;
  selectedReceipt: BillingDocument | null;
  activeModal: "history" | "detail" | "none";
  errorMessage: string | null;
  onSearchChange: (value: string) => void;
  onReceiptPress: (receipt: BillingDocument) => void;
  onPrintReceipt: (receipt: BillingDocument) => Promise<void>;
  onShareReceipt: (receipt: BillingDocument) => Promise<void>;
  onOpenHistory: () => Promise<void>;
  onCloseHistory: () => void;
  onCloseDetail: () => void;
  onLoadReceipts: () => Promise<void>;
}
