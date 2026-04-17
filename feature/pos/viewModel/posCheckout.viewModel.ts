import type { PosCustomer, PosTotals } from "../types/pos.entity.types";
import type { PosMoneyAccountOption } from "../types/pos.ui.types";

export interface PosCheckoutViewModel {
  totals: PosTotals;
  selectedCustomer: PosCustomer | null;
  paymentInput: string;
  selectedSettlementAccountRemoteId: string;
  moneyAccountOptions: readonly PosMoneyAccountOption[];
  isPaymentModalVisible: boolean;
  isPaymentSubmitting: boolean;
  onPaymentInputChange: (value: string) => void;
  onSettlementAccountChange: (settlementAccountRemoteId: string) => void;
  onOpenPaymentModal: () => void;
  onClosePaymentModal: () => void;
  onConfirmPayment: () => Promise<void>;
}
