import { Contact } from "@/feature/contacts/types/contact.types";
import { GetContactsUseCase } from "@/feature/contacts/useCase/getContacts.useCase";
import {
  Order,
  ORDER_STATUS_OPTIONS,
  OrderStatus,
  OrderStatusValue,
} from "@/feature/orders/types/order.types";
import { CreateOrderUseCase } from "@/feature/orders/useCase/createOrder.useCase";
import { DeleteOrderUseCase } from "@/feature/orders/useCase/deleteOrder.useCase";
import { GetOrderByIdUseCase } from "@/feature/orders/useCase/getOrderById.useCase";
import { GetOrdersUseCase } from "@/feature/orders/useCase/getOrders.useCase";
import { RecordOrderPaymentUseCase } from "@/feature/orders/useCase/recordOrderPayment.useCase";
import { RefundOrderUseCase } from "@/feature/orders/useCase/refundOrder.useCase";
import { ReturnOrderUseCase } from "@/feature/orders/useCase/returnOrder.useCase";
import { CancelOrderUseCase } from "@/feature/orders/useCase/cancelOrder.useCase";
import { UpdateOrderUseCase } from "@/feature/orders/useCase/updateOrder.useCase";
import { ChangeOrderStatusUseCase } from "@/feature/orders/useCase/changeOrderStatus.useCase";
import { Product } from "@/feature/products/types/product.types";
import { GetProductsUseCase } from "@/feature/products/useCase/getProducts.useCase";
import { DropdownOption } from "@/shared/components/reusable/DropDown/Dropdown";
import { resolveCurrencyCode } from "@/shared/utils/currency/accountCurrency";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  OrderDetailItemView,
  OrderDetailView,
  OrderFormState,
  OrderLineFormState,
  OrderListItemView,
  OrderMoneyActionValue,
  OrderMoneyFormState,
  OrdersViewModel,
} from "./orders.viewModel";

const createEmptyLineItem = (): OrderLineFormState => ({
  remoteId: Crypto.randomUUID(),
  productRemoteId: "",
  quantity: "1",
});

const EMPTY_FORM: OrderFormState = {
  remoteId: null,
  orderNumber: "",
  orderDate: new Date().toISOString().slice(0, 10),
  customerRemoteId: "",
  deliveryOrPickupDetails: "",
  notes: "",
  tags: "",
  internalRemarks: "",
  status: OrderStatus.Draft,
  items: [createEmptyLineItem()],
};

const EMPTY_MONEY_FORM: OrderMoneyFormState = {
  visible: false,
  action: "payment",
  orderRemoteId: null,
  orderNumber: "",
  amount: "",
  happenedAt: new Date().toISOString().slice(0, 10),
  note: "",
};

const parseNumber = (value: string): number | null => {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
};
const safeTrim = (value: string | null | undefined): string =>
  typeof value === "string" ? value.trim() : "";

const formatDateInput = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

const formatDateLabel = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

const mapOrderToForm = (order: Order): OrderFormState => {
  const orderItems = Array.isArray(order.items) ? order.items : [];

  return {
    remoteId: order.remoteId,
    orderNumber: order.orderNumber,
    orderDate: formatDateInput(order.orderDate),
    customerRemoteId: order.customerRemoteId ?? "",
    deliveryOrPickupDetails: order.deliveryOrPickupDetails ?? "",
    notes: order.notes ?? "",
    tags: order.tags ?? "",
    internalRemarks: order.internalRemarks ?? "",
    status: order.status,
    items:
      orderItems.length > 0
        ? orderItems.map((item) => ({
            remoteId: item.remoteId,
            productRemoteId: item.productRemoteId,
            quantity: String(item.quantity),
          }))
        : [createEmptyLineItem()],
  };
};

const buildNextOrderNumber = (orders: Order[]): string => {
  const maxSerial = orders.reduce((highest, order) => {
    const normalizedOrderNumber =
      typeof order.orderNumber === "string" ? order.orderNumber.trim() : "";
    const match = /(?:ORD)-?(\d+)$/i.exec(normalizedOrderNumber);
    if (!match) {
      return highest;
    }
    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed)) {
      return highest;
    }
    return Math.max(highest, parsed);
  }, 0);

  return `ORD-${String(maxSerial + 1).padStart(3, "0")}`;
};

const buildItemsPreview = (
  order: Order,
  productsByRemoteId: Map<string, Product>,
): string => {
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const previewNames = orderItems
    .slice(0, 2)
    .map((item) => productsByRemoteId.get(item.productRemoteId)?.name ?? "Unknown item");

  if (orderItems.length <= 2) {
    return previewNames.join(", ") || "No items";
  }

  return `${previewNames.join(", ")} +${orderItems.length - 2} more`;
};

const buildOrderListItemView = (params: {
  order: Order;
  contactsByRemoteId: Map<string, Contact>;
  productsByRemoteId: Map<string, Product>;
}): OrderListItemView => {
  const { order, contactsByRemoteId, productsByRemoteId } = params;
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const customerName = order.customerRemoteId
    ? contactsByRemoteId.get(order.customerRemoteId)?.fullName ?? "Customer not found"
    : "No customer";

  return {
    remoteId: order.remoteId,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDateLabel: formatDateLabel(order.orderDate),
    customerName,
    itemCountLabel: `${orderItems.length} item${orderItems.length === 1 ? "" : "s"}`,
    itemsPreview: buildItemsPreview(order, productsByRemoteId),
  };
};

const buildOrderDetailView = (params: {
  order: Order;
  contactsByRemoteId: Map<string, Contact>;
  productsByRemoteId: Map<string, Product>;
}): OrderDetailView => {
  const { order, contactsByRemoteId, productsByRemoteId } = params;
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const customerName = order.customerRemoteId
    ? contactsByRemoteId.get(order.customerRemoteId)?.fullName ?? "Customer not found"
    : "No customer";

  const items: OrderDetailItemView[] = orderItems.map((item) => ({
    remoteId: item.remoteId,
    productName: productsByRemoteId.get(item.productRemoteId)?.name ?? "Unknown item",
    quantityLabel: `${item.quantity}`,
  }));

  return {
    order,
    customerName,
    orderDateLabel: formatDateLabel(order.orderDate),
    items,
  };
};

type Params = {
  accountRemoteId: string | null;
  ownerUserRemoteId: string | null;
  accountDisplayNameSnapshot: string;
  accountCurrencyCode: string | null;
  accountCountryCode: string | null;
  canManage: boolean;
  getOrdersUseCase: GetOrdersUseCase;
  getOrderByIdUseCase: GetOrderByIdUseCase;
  createOrderUseCase: CreateOrderUseCase;
  updateOrderUseCase: UpdateOrderUseCase;
  deleteOrderUseCase: DeleteOrderUseCase;
  changeOrderStatusUseCase: ChangeOrderStatusUseCase;
  cancelOrderUseCase: CancelOrderUseCase;
  returnOrderUseCase: ReturnOrderUseCase;
  recordOrderPaymentUseCase: RecordOrderPaymentUseCase;
  refundOrderUseCase: RefundOrderUseCase;
  getContactsUseCase: GetContactsUseCase;
  getProductsUseCase: GetProductsUseCase;
};

export const useOrdersViewModel = ({
  accountRemoteId,
  ownerUserRemoteId,
  accountDisplayNameSnapshot,
  accountCurrencyCode,
  accountCountryCode,
  canManage,
  getOrdersUseCase,
  getOrderByIdUseCase,
  createOrderUseCase,
  updateOrderUseCase,
  deleteOrderUseCase,
  changeOrderStatusUseCase,
  cancelOrderUseCase,
  returnOrderUseCase,
  recordOrderPaymentUseCase,
  refundOrderUseCase,
  getContactsUseCase,
  getProductsUseCase,
}: Params): OrdersViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<OrderFormState>(EMPTY_FORM);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detail, setDetail] = useState<OrderDetailView | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusDraft, setStatusDraft] = useState<OrderStatusValue>(OrderStatus.Draft);
  const [moneyForm, setMoneyForm] = useState<OrderMoneyFormState>(EMPTY_MONEY_FORM);

  const contactsByRemoteId = useMemo(
    () => new Map(contacts.map((contact) => [contact.remoteId, contact])),
    [contacts],
  );
  const productsByRemoteId = useMemo(
    () => new Map(products.map((product) => [product.remoteId, product])),
    [products],
  );
  const resolvedCurrencyCode = useMemo(
    () =>
      resolveCurrencyCode({
        currencyCode: accountCurrencyCode,
        countryCode: accountCountryCode,
      }),
    [accountCountryCode, accountCurrencyCode],
  );

  const customerOptions = useMemo<DropdownOption[]>(
    () =>
      contacts
        .filter((contact) => !contact.isArchived)
        .map((contact) => ({
          label: contact.fullName,
          value: contact.remoteId,
        })),
    [contacts],
  );

  const productOptions = useMemo<DropdownOption[]>(
    () =>
      products
        .filter((product) => product.status === "active")
        .map((product) => ({
          label: product.name,
          value: product.remoteId,
        })),
    [products],
  );

  const statusOptions = useMemo<DropdownOption[]>(
    () => ORDER_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
    [],
  );

  const loadAll = useCallback(async () => {
    if (!accountRemoteId) {
      setOrders([]);
      setContacts([]);
      setProducts([]);
      setErrorMessage("A business account is required to manage orders.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [ordersResult, contactsResult, productsResult] = await Promise.all([
      getOrdersUseCase.execute({ accountRemoteId }),
      getContactsUseCase.execute({ accountRemoteId }),
      getProductsUseCase.execute(accountRemoteId),
    ]);

    if (!ordersResult.success) {
      setOrders([]);
      setErrorMessage(ordersResult.error.message);
      setIsLoading(false);
      return;
    }

    if (!contactsResult.success) {
      setContacts([]);
      setErrorMessage(contactsResult.error.message);
      setIsLoading(false);
      return;
    }

    if (!productsResult.success) {
      setProducts([]);
      setErrorMessage(productsResult.error.message);
      setIsLoading(false);
      return;
    }

    setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
    setContacts(Array.isArray(contactsResult.value) ? contactsResult.value : []);
    setProducts(Array.isArray(productsResult.value) ? productsResult.value : []);
    setErrorMessage(null);
    setIsLoading(false);
  }, [accountRemoteId, getContactsUseCase, getOrdersUseCase, getProductsUseCase]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const refreshDetail = useCallback(
    async (remoteId: string) => {
      const result = await getOrderByIdUseCase.execute(remoteId);
      if (!result.success) {
        setErrorMessage(result.error.message);
        setDetail(null);
        return;
      }

      setDetail(
        buildOrderDetailView({
          order: result.value,
          contactsByRemoteId,
          productsByRemoteId,
        }),
      );
      setStatusDraft(result.value.status);
    },
    [contactsByRemoteId, getOrderByIdUseCase, productsByRemoteId],
  );

  const summary = useMemo(() => ({
    totalOrders: orders.length,
    pendingCount: orders.filter((order) => order.status === OrderStatus.Pending).length,
    deliveredCount: orders.filter((order) => order.status === OrderStatus.Delivered).length,
    returnedCount: orders.filter((order) => order.status === OrderStatus.Returned).length,
  }), [orders]);

  const orderList = useMemo(
    () =>
      orders.map((order) =>
        buildOrderListItemView({
          order,
          contactsByRemoteId,
          productsByRemoteId,
        }),
      ),
    [contactsByRemoteId, orders, productsByRemoteId],
  );

  const onOpenCreate = useCallback(() => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }

    setEditorMode("create");
    setForm({
      ...EMPTY_FORM,
      orderNumber: buildNextOrderNumber(orders),
      orderDate: new Date().toISOString().slice(0, 10),
      items: [createEmptyLineItem()],
    });
    setErrorMessage(null);
    setIsEditorVisible(true);
  }, [canManage, orders]);

  const onOpenEdit = useCallback(
    async (remoteId: string) => {
      if (!canManage) {
        setErrorMessage("You do not have permission to manage orders.");
        return;
      }

      const result = await getOrderByIdUseCase.execute(remoteId);
      if (!result.success) {
        setErrorMessage(result.error.message);
        return;
      }

      setEditorMode("edit");
      setForm(mapOrderToForm(result.value));
      setErrorMessage(null);
      setIsEditorVisible(true);
    },
    [canManage, getOrderByIdUseCase],
  );

  const onOpenDetail = useCallback(
    async (remoteId: string) => {
      setIsDetailVisible(true);
      await refreshDetail(remoteId);
    },
    [refreshDetail],
  );

  const onCloseEditor = useCallback(() => {
    setIsEditorVisible(false);
    setForm(EMPTY_FORM);
  }, []);

  const onCloseDetail = useCallback(() => {
    setIsDetailVisible(false);
    setDetail(null);
    setIsStatusModalVisible(false);
    setMoneyForm(EMPTY_MONEY_FORM);
  }, []);

  const onFormChange = useCallback(
    (field: keyof Omit<OrderFormState, "items">, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const onLineItemChange = useCallback(
    (remoteId: string, field: keyof OrderLineFormState, value: string) => {
      setForm((current) => ({
        ...current,
        items: (Array.isArray(current.items) ? current.items : []).map((item) =>
          item.remoteId === remoteId ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [],
  );

  const onAddLineItem = useCallback(() => {
    setForm((current) => ({
      ...current,
      items: [...(Array.isArray(current.items) ? current.items : []), createEmptyLineItem()],
    }));
  }, []);

  const onRemoveLineItem = useCallback((remoteId: string) => {
    setForm((current) => ({
      ...current,
      items:
        (Array.isArray(current.items) ? current.items : []).length > 1
          ? (Array.isArray(current.items) ? current.items : []).filter(
              (item) => item.remoteId !== remoteId,
            )
          : Array.isArray(current.items)
            ? current.items
            : [createEmptyLineItem()],
    }));
  }, []);

  const onSubmit = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!accountRemoteId || !ownerUserRemoteId) {
      setErrorMessage("A business account is required to manage orders.");
      return;
    }

    const remoteId = form.remoteId ?? Crypto.randomUUID();
    const formItems = Array.isArray(form.items) ? form.items : [];
    const normalizedItems = formItems
      .map((item, index) => ({
        remoteId: item.remoteId || Crypto.randomUUID(),
        orderRemoteId: remoteId,
        productRemoteId: item.productRemoteId?.trim() ?? "",
        quantity: parseNumber(item.quantity) ?? 0,
        lineOrder: index,
      }))
      .filter((item) => item.productRemoteId.length > 0);

    if (normalizedItems.length === 0) {
      setErrorMessage("Add at least one order item.");
      return;
    }

    if (normalizedItems.some((item) => item.quantity <= 0)) {
      setErrorMessage("Each order item must have quantity greater than zero.");
      return;
    }

    const orderDate = new Date(form.orderDate || new Date().toISOString()).getTime();

    const payload = {
      remoteId,
      ownerUserRemoteId,
      accountRemoteId,
      orderNumber: safeTrim(form.orderNumber) || buildNextOrderNumber(orders),
      orderDate: Number.isFinite(orderDate) ? orderDate : Date.now(),
      customerRemoteId: safeTrim(form.customerRemoteId) || null,
      deliveryOrPickupDetails: safeTrim(form.deliveryOrPickupDetails) || null,
      notes: safeTrim(form.notes) || null,
      tags: safeTrim(form.tags) || null,
      internalRemarks: safeTrim(form.internalRemarks) || null,
      status: form.status,
      items: normalizedItems.map((item) => ({ ...item, orderRemoteId: remoteId })),
    };

    const result = form.remoteId
      ? await updateOrderUseCase.execute(payload)
      : await createOrderUseCase.execute(payload);

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setIsEditorVisible(false);
    setForm(EMPTY_FORM);
    await loadAll();
    await refreshDetail(result.value.remoteId);
  }, [
    accountRemoteId,
    canManage,
    createOrderUseCase,
    form,
    loadAll,
    orders,
    ownerUserRemoteId,
    refreshDetail,
    updateOrderUseCase,
  ]);

  const onDelete = useCallback(
    async (remoteId: string) => {
      if (!canManage) {
        setErrorMessage("You do not have permission to manage orders.");
        return;
      }

      const result = await deleteOrderUseCase.execute(remoteId);
      if (!result.success) {
        setErrorMessage(result.error.message);
        return;
      }

      await loadAll();
      onCloseDetail();
    },
    [canManage, deleteOrderUseCase, loadAll, onCloseDetail],
  );

  const onOpenStatusModal = useCallback(() => {
    if (!detail || !canManage) {
      return;
    }
    setStatusDraft(detail.order.status);
    setIsStatusModalVisible(true);
  }, [canManage, detail]);

  const onCloseStatusModal = useCallback(() => {
    setIsStatusModalVisible(false);
  }, []);

  const onSubmitStatus = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!detail) {
      return;
    }

    const result = await changeOrderStatusUseCase.execute({
      remoteId: detail.order.remoteId,
      status: statusDraft,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setIsStatusModalVisible(false);
    await loadAll();
    await refreshDetail(detail.order.remoteId);
  }, [
    canManage,
    changeOrderStatusUseCase,
    detail,
    loadAll,
    refreshDetail,
    statusDraft,
  ]);

  const onCancelOrder = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!detail) {
      return;
    }

    const result = await cancelOrderUseCase.execute(detail.order.remoteId);
    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    await loadAll();
    await refreshDetail(detail.order.remoteId);
  }, [canManage, cancelOrderUseCase, detail, loadAll, refreshDetail]);

  const onReturnOrder = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!detail) {
      return;
    }

    const result = await returnOrderUseCase.execute(detail.order.remoteId);
    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    await loadAll();
    await refreshDetail(detail.order.remoteId);
  }, [canManage, detail, loadAll, refreshDetail, returnOrderUseCase]);

  const onOpenMoneyAction = useCallback((action: OrderMoneyActionValue) => {
    if (!detail || !canManage) {
      return;
    }
    setMoneyForm({
      visible: true,
      action,
      orderRemoteId: detail.order.remoteId,
      orderNumber: detail.order.orderNumber,
      amount: "",
      happenedAt: new Date().toISOString().slice(0, 10),
      note: "",
    });
  }, [canManage, detail]);

  const onCloseMoneyAction = useCallback(() => {
    setMoneyForm(EMPTY_MONEY_FORM);
  }, []);

  const onMoneyFormChange = useCallback(
    (field: keyof Omit<OrderMoneyFormState, "visible" | "action">, value: string) => {
      setMoneyForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const onSubmitMoneyAction = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!moneyForm.orderRemoteId || !detail) {
      return;
    }
    if (!ownerUserRemoteId || !accountRemoteId) {
      setErrorMessage("Active business account context is required.");
      return;
    }
    const amount = parseNumber(moneyForm.amount);
    if (amount === null || amount <= 0) {
      setErrorMessage("Amount must be greater than zero.");
      return;
    }
    const happenedAt = new Date(moneyForm.happenedAt || new Date().toISOString()).getTime();
    if (!Number.isFinite(happenedAt) || happenedAt <= 0) {
      setErrorMessage("Enter a valid date.");
      return;
    }

    const basePayload = {
      orderRemoteId: moneyForm.orderRemoteId,
      orderNumber: moneyForm.orderNumber,
      ownerUserRemoteId,
      accountRemoteId,
      accountDisplayNameSnapshot,
      currencyCode: resolvedCurrencyCode,
      amount,
      happenedAt,
      note: moneyForm.note.trim() || null,
    };

    const result = moneyForm.action === "payment"
      ? await recordOrderPaymentUseCase.execute(basePayload)
      : await refundOrderUseCase.execute(basePayload);

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setMoneyForm(EMPTY_MONEY_FORM);
    await loadAll();
    await refreshDetail(detail.order.remoteId);
  }, [
    canManage,
    accountDisplayNameSnapshot,
    accountRemoteId,
    detail,
    loadAll,
    moneyForm,
    ownerUserRemoteId,
    recordOrderPaymentUseCase,
    resolvedCurrencyCode,
    refreshDetail,
    refundOrderUseCase,
  ]);

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      canManage,
      summary,
      orders: orderList,
      customerOptions,
      productOptions,
      statusOptions,
      isEditorVisible,
      editorMode,
      form,
      isDetailVisible,
      detail,
      isStatusModalVisible,
      statusDraft,
      moneyForm,
      onRefresh: loadAll,
      onOpenCreate,
      onOpenEdit,
      onOpenDetail,
      onCloseEditor,
      onCloseDetail,
      onFormChange,
      onLineItemChange,
      onAddLineItem,
      onRemoveLineItem,
      onSubmit,
      onDelete,
      onOpenStatusModal,
      onCloseStatusModal,
      onStatusDraftChange: setStatusDraft,
      onSubmitStatus,
      onCancelOrder,
      onReturnOrder,
      onOpenMoneyAction,
      onCloseMoneyAction,
      onMoneyFormChange,
      onSubmitMoneyAction,
    }),
    [
      canManage,
      customerOptions,
      detail,
      editorMode,
      errorMessage,
      form,
      isDetailVisible,
      isEditorVisible,
      isLoading,
      isStatusModalVisible,
      loadAll,
      moneyForm,
      onAddLineItem,
      onCancelOrder,
      onCloseDetail,
      onCloseEditor,
      onCloseMoneyAction,
      onCloseStatusModal,
      onDelete,
      onFormChange,
      onLineItemChange,
      onMoneyFormChange,
      onOpenCreate,
      onOpenDetail,
      onOpenEdit,
      onOpenMoneyAction,
      onOpenStatusModal,
      onRemoveLineItem,
      onReturnOrder,
      onSubmit,
      onSubmitMoneyAction,
      onSubmitStatus,
      orderList,
      productOptions,
      statusDraft,
      statusOptions,
      summary,
    ],
  );
};
