import { useMemo } from "react";
import type { PosCartViewModel } from "./posCart.viewModel";
import type { PosScreenEngine } from "./internal/posScreen.engine.impl";

interface UsePosCartViewModelParams {
  engine: PosScreenEngine;
}

export function usePosCartViewModel({
  engine,
}: UsePosCartViewModelParams): PosCartViewModel {
  return useMemo(
    () => ({
      cartLines: engine.cartLines,
      totals: engine.totals,
      discountInput: engine.discountInput,
      surchargeInput: engine.surchargeInput,
      isDiscountModalVisible: engine.activeModal === "discount",
      isSurchargeModalVisible: engine.activeModal === "surcharge",
      onIncreaseQuantity: engine.onIncreaseQuantity,
      onDecreaseQuantity: engine.onDecreaseQuantity,
      onRemoveCartLine: engine.onRemoveCartLine,
      onDiscountInputChange: engine.onDiscountInputChange,
      onSurchargeInputChange: engine.onSurchargeInputChange,
      onOpenDiscountModal: engine.onOpenDiscountModal,
      onOpenSurchargeModal: engine.onOpenSurchargeModal,
      onCloseAdjustmentModal: engine.onCloseModal,
      onApplyDiscount: engine.onApplyDiscount,
      onApplySurcharge: engine.onApplySurcharge,
      onClearCart: engine.onClearCart,
    }),
    [engine],
  );
}
