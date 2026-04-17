import { useMemo } from "react";
import type { PosCheckoutViewModel } from "./posCheckout.viewModel";
import type { PosScreenEngine } from "./internal/posScreen.engine.impl";

interface UsePosCheckoutViewModelParams {
  engine: PosScreenEngine;
}

export function usePosCheckoutViewModel({
  engine,
}: UsePosCheckoutViewModelParams): PosCheckoutViewModel {
  return useMemo(
    () => ({
      totals: engine.totals,
      selectedCustomer: engine.selectedCustomer,
      paymentInput: engine.paymentInput,
      selectedSettlementAccountRemoteId: engine.selectedSettlementAccountRemoteId,
      moneyAccountOptions: engine.moneyAccountOptions,
      isPaymentModalVisible: engine.activeModal === "payment",
      isPaymentSubmitting: engine.isPaymentSubmitting,
      onPaymentInputChange: engine.onPaymentInputChange,
      onSettlementAccountChange: engine.onSettlementAccountChange,
      onOpenPaymentModal: engine.onOpenPaymentModal,
      onClosePaymentModal: engine.onClosePaymentModal,
      onConfirmPayment: engine.onConfirmPayment,
    }),
    [engine],
  );
}
