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
  itemCountLabel: string;
  itemsPreview: string;
};

export type OrderDetailItemView = {
  remoteId: string;
  productName: string;
  quantityLabel: string;
};

export type OrderDetailView = {
  order: Order;
  customerName: string;
  orderDateLabel: string;
  items: OrderDetailItemView[];
};

export type OrderMoneyActionValue = "payment" | "refund";

export type OrderMoneyFormState = {
  visible: boolean;
  action: OrderMoneyActionValue;
  orderRemoteId: string | null;
  orderNumber: string;
  amount: string;
  happenedAt: string;
  note: string;
};

export interface OrdersViewModel {
  isLoading: boolean;
  errorMessage: string | null;
  canManage: boolean;
  summary: OrderSummaryState;
  orders: OrderListItemView[];
  customerOptions: DropdownOption[];
  productOptions: DropdownOption[];
  statusOptions: DropdownOption[];
  isEditorVisible: boolean;
  editorMode: "create" | "edit";
  form: OrderFormState;
  isDetailVisible: boolean;
  detail: OrderDetailView | null;
  isStatusModalVisible: boolean;
  statusDraft: OrderStatusValue;
  moneyForm: OrderMoneyFormState;
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
  onMoneyFormChange: (field: keyof Omit<OrderMoneyFormState, "visible" | "action">, value: string) => void;
  onSubmitMoneyAction: () => Promise<void>;
}
