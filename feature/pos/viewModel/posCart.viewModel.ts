import type { PosCartLine, PosTotals } from "../types/pos.entity.types";

export interface PosCartViewModel {
  cartLines: readonly PosCartLine[];
  totals: PosTotals;
  discountInput: string;
  surchargeInput: string;
  isDiscountModalVisible: boolean;
  isSurchargeModalVisible: boolean;
  onIncreaseQuantity: (lineId: string) => Promise<void>;
  onDecreaseQuantity: (lineId: string) => Promise<void>;
  onRemoveCartLine: (lineId: string) => Promise<void>;
  onDiscountInputChange: (value: string) => void;
  onSurchargeInputChange: (value: string) => void;
  onOpenDiscountModal: () => void;
  onOpenSurchargeModal: () => void;
  onCloseAdjustmentModal: () => void;
  onApplyDiscount: () => Promise<void>;
  onApplySurcharge: () => Promise<void>;
  onClearCart: () => Promise<void>;
}
