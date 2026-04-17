import type { PosReceipt } from "../types/pos.entity.types";

export interface PosReceiptViewModel {
  receipt: PosReceipt | null;
  isReceiptModalVisible: boolean;
  onOpenReceiptModal: () => void;
  onCloseReceiptModal: () => void;
  onPrintReceipt: () => Promise<void>;
  onShareReceipt: () => Promise<void>;
}
