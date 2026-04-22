import { OrderStatus, OrderStatusValue } from "@/feature/orders/types/order.types";
import { validateOrderMoneyForm, parseOrderMoneyDateInput } from "@/feature/orders/validation/validateOrderMoneyForm";
import * as Crypto from "expo-crypto";
import { useCallback, useState } from "react";
import {
  OrderMoneyActionViewModelParams,
  OrderMoneyActionViewModelState,
} from "./orderMoneyAction.viewModel";
import {
  EMPTY_MONEY_FORM,
  parseNumber,
} from "./ordersPresentation.helpers";

export const useOrderMoneyActionViewModel = ({
  canManage,
  accountRemoteId,
  ownerUserRemoteId,
  accountDisplayNameSnapshot,
  resolvedCurrencyCode,
  detail,
  moneyAccountOptions,
  setErrorMessage,
  loadAll,
  refreshDetail,
  changeOrderStatusUseCase,
  cancelOrderUseCase,
  returnOrderUseCase,
  recordOrderPaymentUseCase,
  refundOrderUseCase,
}: OrderMoneyActionViewModelParams): OrderMoneyActionViewModelState => {
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusDraft, setStatusDraft] = useState<OrderStatusValue>(
    OrderStatus.Draft,
  );
  const [moneyForm, setMoneyForm] = useState(EMPTY_MONEY_FORM);

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
    setErrorMessage,
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
  }, [
    cancelOrderUseCase,
    canManage,
    detail,
    loadAll,
    refreshDetail,
    setErrorMessage,
  ]);

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
  }, [
    canManage,
    detail,
    loadAll,
    refreshDetail,
    returnOrderUseCase,
    setErrorMessage,
  ]);

  const onOpenMoneyAction = useCallback(
    (action: "payment" | "refund") => {
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
        settlementMoneyAccountRemoteId: moneyAccountOptions[0]?.value ?? "",
        note: "",
        attemptRemoteId: Crypto.randomUUID(),
        fieldErrors: {},
      });
      setErrorMessage(null);
    },
    [canManage, detail, moneyAccountOptions, setErrorMessage],
  );

  const onCloseMoneyAction = useCallback(() => {
    setMoneyForm(EMPTY_MONEY_FORM);
  }, []);

  const onMoneyFormChange = useCallback(
    (
      field: keyof Omit<typeof moneyForm, "visible" | "action" | "fieldErrors">,
      value: string,
    ) => {
      setErrorMessage(null);
      setMoneyForm((current) => ({
        ...current,
        [field]: value,
        fieldErrors:
          field === "amount"
            ? { ...current.fieldErrors, amount: undefined }
            : field === "happenedAt"
              ? { ...current.fieldErrors, happenedAt: undefined }
              : field === "settlementMoneyAccountRemoteId"
                ? {
                    ...current.fieldErrors,
                    settlementMoneyAccountRemoteId: undefined,
                  }
                : current.fieldErrors,
      }));
    },
    [setErrorMessage],
  );

  const onSubmitMoneyAction = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage orders.");
      return;
    }
    if (!moneyForm.orderRemoteId || !detail) {
      return;
    }

    if (!moneyForm.attemptRemoteId?.trim()) {
      setErrorMessage("Payment attempt id is required.");
      return;
    }
    if (!ownerUserRemoteId || !accountRemoteId) {
      setErrorMessage("Active business account context is required.");
      return;
    }

    const selectedMoneyAccount = moneyAccountOptions.find(
      (option) => option.value === moneyForm.settlementMoneyAccountRemoteId,
    );

    const nextFieldErrors = validateOrderMoneyForm({
      amount: moneyForm.amount,
      happenedAt: moneyForm.happenedAt,
      settlementMoneyAccountRemoteId: moneyForm.settlementMoneyAccountRemoteId,
      selectedMoneyAccountExists: Boolean(selectedMoneyAccount),
    });

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setMoneyForm((current) => ({
        ...current,
        fieldErrors: nextFieldErrors,
      }));
      setErrorMessage(null);
      return;
    }

    const amount = parseNumber(moneyForm.amount);
    const happenedAt = parseOrderMoneyDateInput(moneyForm.happenedAt);

    if (amount === null || happenedAt === null || !selectedMoneyAccount) {
      setMoneyForm((current) => ({
        ...current,
        fieldErrors: {
          amount:
            amount === null || amount <= 0
              ? "Amount must be greater than zero."
              : undefined,
          happenedAt:
            happenedAt === null
              ? "Enter a valid date in YYYY-MM-DD format."
              : undefined,
          settlementMoneyAccountRemoteId: !selectedMoneyAccount
            ? "Choose a valid money account."
            : undefined,
        },
      }));
      setErrorMessage(null);
      return;
    }

    const paymentPayload = {
      orderRemoteId: moneyForm.orderRemoteId,
      orderNumber: moneyForm.orderNumber,
      ownerUserRemoteId,
      accountRemoteId,
      accountDisplayNameSnapshot,
      currencyCode: resolvedCurrencyCode,
      amount,
      happenedAt,
      settlementMoneyAccountRemoteId: selectedMoneyAccount.value,
      settlementMoneyAccountDisplayNameSnapshot: selectedMoneyAccount.label,
      note: moneyForm.note.trim() || null,
      paymentAttemptRemoteId: moneyForm.attemptRemoteId,
    };

    const refundPayload = {
      orderRemoteId: moneyForm.orderRemoteId,
      orderNumber: moneyForm.orderNumber,
      ownerUserRemoteId,
      accountRemoteId,
      accountDisplayNameSnapshot,
      currencyCode: resolvedCurrencyCode,
      amount,
      happenedAt,
      settlementMoneyAccountRemoteId: selectedMoneyAccount.value,
      settlementMoneyAccountDisplayNameSnapshot: selectedMoneyAccount.label,
      note: moneyForm.note.trim() || null,
      refundAttemptRemoteId: moneyForm.attemptRemoteId,
    };

    const result =
      moneyForm.action === "payment"
        ? await recordOrderPaymentUseCase.execute(paymentPayload)
        : await refundOrderUseCase.execute(refundPayload);

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setMoneyForm(EMPTY_MONEY_FORM);
    await loadAll();
    await refreshDetail(detail.order.remoteId);
  }, [
    accountDisplayNameSnapshot,
    accountRemoteId,
    canManage,
    detail,
    loadAll,
    moneyAccountOptions,
    moneyForm,
    ownerUserRemoteId,
    recordOrderPaymentUseCase,
    refreshDetail,
    refundOrderUseCase,
    resolvedCurrencyCode,
    setErrorMessage,
  ]);

  const resetModalState = useCallback(() => {
    setIsStatusModalVisible(false);
    setMoneyForm(EMPTY_MONEY_FORM);
  }, []);

  return {
    isStatusModalVisible,
    statusDraft,
    moneyForm,
    onOpenStatusModal,
    onCloseStatusModal,
    onStatusDraftChange: (value) => setStatusDraft(value),
    onSubmitStatus,
    onCancelOrder,
    onReturnOrder,
    onOpenMoneyAction,
    onCloseMoneyAction,
    onMoneyFormChange,
    onSubmitMoneyAction,
    resetModalState,
  };
};
