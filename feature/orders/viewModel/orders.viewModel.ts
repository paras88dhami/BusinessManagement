import { OrderStatusValue } from "@/feature/orders/types/order.types";
import {
  OrderFormPricingPreview,
  OrderFormState,
  OrderLineFormState,
  OrderMoneyActionValue,
  OrderMoneyFormState,
  OrderSummaryState,
} from "@/feature/orders/types/order.state.types";
import {
  OrderDetailView,
  OrderListItemView,
} from "@/feature/orders/types/order.view.types";
import { DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";

export type {
  OrderFormPricingPreview,
  OrderFormState,
  OrderLineFormState,
  OrderMoneyActionValue,
  OrderMoneyFormState,
  OrderSummaryState,
} from "@/feature/orders/types/order.state.types";
export type {
  OrderDetailItemView,
  OrderDetailPricingView,
  OrderDetailView,
  OrderListItemView,
} from "@/feature/orders/types/order.view.types";

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
