import type { PosSplitDraftPart } from "../types/pos.entity.types";
import type { PosMoneyAccountOption } from "../types/pos.ui.types";

export interface PosSplitBillViewModel {
  grandTotal: number;
  splitBillDraftParts: readonly PosSplitDraftPart[];
  splitBillAllocatedAmount: number;
  splitBillRemainingAmount: number;
  splitBillErrorMessage: string | null;
  moneyAccountOptions: readonly PosMoneyAccountOption[];
  isSplitBillModalVisible: boolean;
  isSplitBillSubmitting: boolean;
  onOpenSplitBillModal: () => void;
  onCloseSplitBillModal: () => void;
  onApplyEqualSplit: (count: number) => Promise<void>;
  onAddSplitBillPart: () => Promise<void>;
  onRemoveSplitBillPart: (paymentPartId: string) => Promise<void>;
  onChangeSplitBillPartPayerLabel: (
    paymentPartId: string,
    value: string,
  ) => Promise<void>;
  onChangeSplitBillPartAmount: (
    paymentPartId: string,
    value: string,
  ) => Promise<void>;
  onChangeSplitBillPartSettlementAccount: (
    paymentPartId: string,
    settlementAccountRemoteId: string,
  ) => Promise<void>;
  onCompleteSplitBillPayment: () => Promise<void>;
}
