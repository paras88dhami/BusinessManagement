import { OrderStatusValue } from "@/feature/orders/types/order.types";

export type OrderLineFormState = {
  remoteId: string;
  productRemoteId: string;
  quantity: string;
};

export type OrderFormState = {
  remoteId: string | null;
  orderNumber: string;
  orderDate: string;
  customerRemoteId: string;
  deliveryOrPickupDetails: string;
  notes: string;
  tags: string;
  internalRemarks: string;
  status: OrderStatusValue;
  items: OrderLineFormState[];
};

export type OrderFormPricingPreview = {
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDueAmount: number;
  subtotalLabel: string;
  taxLabel: string;
  discountLabel: string;
  totalLabel: string;
  paidLabel: string;
  balanceDueLabel: string;
  taxRateLabel: string;
};

export type OrderSummaryState = {
  totalOrders: number;
  pendingCount: number;
  deliveredCount: number;
  returnedCount: number;
};

export type OrderMoneyActionValue = "payment" | "refund";

export type OrderMoneyFormState = {
  visible: boolean;
  action: OrderMoneyActionValue;
  orderRemoteId: string | null;
  orderNumber: string;
  amount: string;
  happenedAt: string;
  settlementMoneyAccountRemoteId: string;
  note: string;
};
