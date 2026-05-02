import {
  OrderFormFieldErrors,
  OrderFormState,
  OrderLineFormFieldErrors,
  OrderLineFormState,
} from "@/feature/orders/types/order.state.types";
import { getOrderEditBlockedReason } from "@/feature/orders/utils/orderLifecyclePolicy.util";
import { validateOrderEditorForm } from "@/feature/orders/validation/validateOrderEditorForm";
import * as Crypto from "expo-crypto";
import { useCallback, useMemo, useState } from "react";
import {
  OrderEditorViewModelParams,
  OrderEditorViewModelState,
} from "./orderEditor.viewModel";
import {
  buildNextOrderNumber,
  calculateFormPricingPreview,
  createEmptyLineItem,
  EMPTY_FORM,
  mapOrderToForm,
  parseNumber,
  safeTrim,
} from "./ordersPresentation.helpers";

const clearFormFieldError = (
  fieldErrors: OrderFormFieldErrors,
  field: keyof OrderFormFieldErrors,
): OrderFormFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

const clearLineFieldError = (
  fieldErrors: OrderLineFormFieldErrors,
  field: keyof OrderLineFormFieldErrors,
): OrderLineFormFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

export const useOrderEditorViewModel = ({
  accountRemoteId,
  ownerUserRemoteId,
  canManage,
  accountCountryCode,
  resolvedCurrencyCode,
  taxRatePercent,
  orders,
  settlementSnapshotsByOrderRemoteId,
  productPriceByRemoteId,
  createOrderUseCase,
  updateOrderUseCase,
  getOrderByIdUseCase,
  getOrderSettlementSnapshotsUseCase,
  loadAll,
  refreshDetail,
  setErrorMessage,
  setSuccessMessage,
}: OrderEditorViewModelParams): OrderEditorViewModelState => {
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState(EMPTY_FORM);

  const formPricingPreview = useMemo(
    () =>
      calculateFormPricingPreview({
        form,
        editorMode,
        orders,
        settlementSnapshotsByOrderRemoteId,
        productPriceByRemoteId,
        taxRatePercent,
        currencyCode: resolvedCurrencyCode,
        countryCode: accountCountryCode,
      }),
    [
      accountCountryCode,
      editorMode,
      form,
      orders,
      productPriceByRemoteId,
      resolvedCurrencyCode,
      settlementSnapshotsByOrderRemoteId,
      taxRatePercent,
    ],
  );

  const onOpenCreate = useCallback(() => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }

    setEditorMode("create");
    setForm({
      ...EMPTY_FORM,
      orderNumber: buildNextOrderNumber([...orders]),
      orderDate: new Date().toISOString().slice(0, 10),
      items: [createEmptyLineItem()],
      fieldErrors: {},
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditorVisible(true);
  }, [canManage, orders, setErrorMessage, setSuccessMessage]);

  const onOpenEdit = useCallback(
    async (remoteId: string) => {
      if (!canManage) {
        setErrorMessage("You do not have permission to manage orders.");
        return;
      }

      const orderResult = await getOrderByIdUseCase.execute(remoteId);
      if (!orderResult.success) {
        setErrorMessage(orderResult.error.message);
        return;
      }

      if (!accountRemoteId || !ownerUserRemoteId) {
        setErrorMessage("A business account is required to manage orders.");
        return;
      }

      const snapshotResult = await getOrderSettlementSnapshotsUseCase.execute({
        accountRemoteId,
        ownerUserRemoteId,
        orders: [orderResult.value],
      });

      if (!snapshotResult.success) {
        setErrorMessage(snapshotResult.error.message);
        return;
      }

      const settlementSnapshot = snapshotResult.value[orderResult.value.remoteId] ?? null;

      const blockedReason = getOrderEditBlockedReason({
        order: orderResult.value,
        settlementSnapshot,
      });

      if (blockedReason) {
        setErrorMessage(blockedReason);
        return;
      }

      setEditorMode("edit");
      setForm(mapOrderToForm(orderResult.value));
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsEditorVisible(true);
    },
    [
      accountRemoteId,
      canManage,
      getOrderByIdUseCase,
      getOrderSettlementSnapshotsUseCase,
      ownerUserRemoteId,
      setErrorMessage,
      setSuccessMessage,
    ],
  );

  const onCloseEditor = useCallback(() => {
    setIsEditorVisible(false);
    setForm(EMPTY_FORM);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [setErrorMessage, setSuccessMessage]);

  const onFormChange = useCallback(
    (field: keyof Omit<OrderFormState, "items" | "fieldErrors">, value: string) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setForm((current) => ({
        ...current,
        [field]: value,
        fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
      }));
    },
    [setErrorMessage, setSuccessMessage],
  );

  const onLineItemChange = useCallback(
    (
      remoteId: string,
      field: keyof Omit<OrderLineFormState, "fieldErrors">,
      value: string,
    ) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setForm((current) => ({
        ...current,
        fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
        items: (Array.isArray(current.items) ? current.items : []).map((item) =>
          item.remoteId === remoteId
            ? {
                ...item,
                [field]: value,
                fieldErrors:
                  field === "productRemoteId"
                    ? clearLineFieldError(item.fieldErrors, "productRemoteId")
                    : field === "quantity"
                      ? clearLineFieldError(item.fieldErrors, "quantity")
                      : item.fieldErrors,
              }
            : item,
        ),
      }));
    },
    [setErrorMessage, setSuccessMessage],
  );

  const onAddLineItem = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setForm((current) => ({
      ...current,
      fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
      items: [...(Array.isArray(current.items) ? current.items : []), createEmptyLineItem()],
    }));
  }, [setErrorMessage, setSuccessMessage]);

  const onRemoveLineItem = useCallback(
    (remoteId: string) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setForm((current) => ({
        ...current,
        fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
        items:
          (Array.isArray(current.items) ? current.items : []).length > 1
            ? (Array.isArray(current.items) ? current.items : []).filter(
                (item) => item.remoteId !== remoteId,
              )
            : Array.isArray(current.items)
              ? current.items
              : [createEmptyLineItem()],
      }));
    },
    [setErrorMessage, setSuccessMessage],
  );

  const onSubmit = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!accountRemoteId || !ownerUserRemoteId) {
      setErrorMessage("A business account is required to manage orders.");
      return;
    }

    const validationResult = validateOrderEditorForm(form);

    if (
      Object.values(validationResult.formFieldErrors).some(Boolean) ||
      validationResult.items.some((item) => Object.values(item.fieldErrors).some(Boolean))
    ) {
      setForm((current) => ({
        ...current,
        fieldErrors: validationResult.formFieldErrors,
        items: validationResult.items,
      }));
      setErrorMessage(null);
      return;
    }

    const remoteId = form.remoteId ?? Crypto.randomUUID();
    const formItems = Array.isArray(validationResult.items) ? validationResult.items : [];
    const normalizedItems = formItems
      .map((item, index) => ({
        remoteId: item.remoteId || Crypto.randomUUID(),
        orderRemoteId: remoteId,
        productRemoteId: item.productRemoteId?.trim() ?? "",
        quantity: parseNumber(item.quantity) ?? 0,
        lineOrder: index,
      }))
      .filter((item) => item.productRemoteId.length > 0);

    const orderDate = new Date(form.orderDate || new Date().toISOString()).getTime();

    let currentOrder =
      form.remoteId !== null
        ? orders.find((order) => order.remoteId === form.remoteId) ?? null
        : null;

    if (form.remoteId && !currentOrder) {
      const latestOrderResult = await getOrderByIdUseCase.execute(form.remoteId);
      if (!latestOrderResult.success) {
        setErrorMessage(latestOrderResult.error.message);
        return;
      }
      currentOrder = latestOrderResult.value;
    }

    const payload = {
      remoteId,
      ownerUserRemoteId,
      accountRemoteId,
      orderNumber: safeTrim(form.orderNumber) || buildNextOrderNumber([...orders]),
      orderDate: Number.isFinite(orderDate) ? orderDate : Date.now(),
      customerRemoteId: safeTrim(form.customerRemoteId) || null,
      deliveryOrPickupDetails: safeTrim(form.deliveryOrPickupDetails) || null,
      notes: safeTrim(form.notes) || null,
      tags: safeTrim(form.tags) || null,
      internalRemarks: safeTrim(form.internalRemarks) || null,
      status: form.status,
      taxRatePercent,
      linkedBillingDocumentRemoteId:
        currentOrder?.linkedBillingDocumentRemoteId ?? null,
      linkedLedgerDueEntryRemoteId:
        currentOrder?.linkedLedgerDueEntryRemoteId ?? null,
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
    setSuccessMessage(form.remoteId ? "Order updated." : "Order created.");
  }, [
    accountRemoteId,
    canManage,
    createOrderUseCase,
    form,
    getOrderByIdUseCase,
    loadAll,
    orders,
    ownerUserRemoteId,
    refreshDetail,
    setErrorMessage,
    setSuccessMessage,
    taxRatePercent,
    updateOrderUseCase,
  ]);

  return {
    isEditorVisible,
    editorMode,
    form,
    formPricingPreview,
    onOpenCreate,
    onOpenEdit,
    onCloseEditor,
    onFormChange,
    onLineItemChange,
    onAddLineItem,
    onRemoveLineItem,
    onSubmit,
  };
};
