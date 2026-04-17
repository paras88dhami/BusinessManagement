import { useMemo } from "react";
import type { PosReceiptViewModel } from "./posReceipt.viewModel";
import type { PosScreenEngine } from "./internal/posScreen.engine.impl";

interface UsePosReceiptViewModelParams {
  engine: PosScreenEngine;
}

export function usePosReceiptViewModel({
  engine,
}: UsePosReceiptViewModelParams): PosReceiptViewModel {
  return useMemo(
    () => ({
      receipt: engine.receipt,
      isReceiptModalVisible: engine.activeModal === "receipt",
      onOpenReceiptModal: engine.onOpenReceiptModal,
      onCloseReceiptModal: engine.onCloseReceiptModal,
      onPrintReceipt: engine.onPrintReceipt,
      onShareReceipt: engine.onShareReceipt,
    }),
    [engine],
  );
}
