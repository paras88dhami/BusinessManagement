import { useMemo } from "react";
import type { PosSplitBillViewModel } from "./posSplitBill.viewModel";
import type { PosScreenEngine } from "./internal/posScreen.engine.impl";

interface UsePosSplitBillViewModelParams {
  engine: PosScreenEngine;
}

export function usePosSplitBillViewModel({
  engine,
}: UsePosSplitBillViewModelParams): PosSplitBillViewModel {
  return useMemo(
    () => ({
      grandTotal: engine.totals.grandTotal,
      splitBillDraftParts: engine.splitBillDraftParts,
      splitBillAllocatedAmount: engine.splitBillAllocatedAmount,
      splitBillRemainingAmount: engine.splitBillRemainingAmount,
      splitBillErrorMessage: engine.splitBillErrorMessage,
      moneyAccountOptions: engine.moneyAccountOptions,
      isSplitBillModalVisible: engine.activeModal === "split-bill",
      isSplitBillSubmitting: engine.isSplitBillSubmitting,
      onOpenSplitBillModal: engine.onOpenSplitBillModal,
      onCloseSplitBillModal: engine.onCloseSplitBillModal,
      onApplyEqualSplit: engine.onApplyEqualSplit,
      onAddSplitBillPart: engine.onAddSplitBillPart,
      onRemoveSplitBillPart: engine.onRemoveSplitBillPart,
      onChangeSplitBillPartPayerLabel: engine.onChangeSplitBillPartPayerLabel,
      onChangeSplitBillPartAmount: engine.onChangeSplitBillPartAmount,
      onChangeSplitBillPartSettlementAccount:
        engine.onChangeSplitBillPartSettlementAccount,
      onCompleteSplitBillPayment: engine.onCompleteSplitBillPayment,
    }),
    [engine],
  );
}
