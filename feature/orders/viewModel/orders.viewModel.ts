import { Order, OrderStatusValue } from "@/feature/orders/types/order.types";
import { DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";

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

export type OrderListItemView = {
  remoteId: string;
  orderNumber: string;
  status: OrderStatusValue;
  orderDateLabel: string;
  customerName: string;
  paymentMethodLabel: string;
  itemCountLabel: string;
  itemsPreview: string;
  totalLabel: string;
  balanceDueLabel: string | null;
};

export type OrderDetailItemView = {
  remoteId: string;
  productName: string;
  quantityLabel: string;
  unitPriceLabel: string;
  lineTotalLabel: string;
};

export type OrderDetailPricingView = {
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

export type OrderDetailView = {
  order: Order;
  customerName: string;
  customerPhone: string | null;
  paymentMethodLabel: string;
  orderDateLabel: string;
  items: OrderDetailItemView[];
  pricing: OrderDetailPricingView;
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

export interface OrdersViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  canManage: boolean;
  summary: OrderSummaryState;
  orders: OrderListItemView[];
  customerOptions: DropdownOption[];
  customerPhoneByRemoteId: Readonly<Record<string, string | null>>;
  productOptions: DropdownOption[];
  productPriceByRemoteId: Readonly<Record<string, number>>;
  statusOptions: DropdownOption[];
  paymentMethodOptions: readonly DropdownOption[];
  isEditorVisible: boolean;
  editorMode: "create" | "edit";
  form: OrderFormState;
  formPricingPreview: OrderFormPricingPreview;
  isDetailVisible: boolean;
  detail: OrderDetailView | null;
  isStatusModalVisible: boolean;
  statusDraft: OrderStatusValue;
  moneyForm: OrderMoneyFormState;
  moneyAccountOptions: DropdownOption[];
  onRefresh: () => Promise<void>;
  onOpenCreate: () => void;
  onOpenEdit: (remoteId: string) => Promise<void>;
  onOpenDetail: (remoteId: string) => Promise<void>;
  onCloseEditor: () => void;
  onCloseDetail: () => void;
  onFormChange: (field: keyof Omit<OrderFormState, "items">, value: string) => void;
  onLineItemChange: (remoteId: string, field: keyof OrderLineFormState, value: string) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (remoteId: string) => void;
  onSubmit: () => Promise<void>;
  onDelete: (remoteId: string) => Promise<void>;
  onOpenStatusModal: () => void;
  onCloseStatusModal: () => void;
  onStatusDraftChange: (value: OrderStatusValue) => void;
  onSubmitStatus: () => Promise<void>;
  onCancelOrder: () => Promise<void>;
  onReturnOrder: () => Promise<void>;
  onOpenMoneyAction: (action: OrderMoneyActionValue) => void;
  onCloseMoneyAction: () => void;
  onMoneyFormChange: (
    field: keyof Omit<OrderMoneyFormState, "visible" | "action">,
    value: string,
  ) => void;
  onSubmitMoneyAction: () => Promise<void>;
}
