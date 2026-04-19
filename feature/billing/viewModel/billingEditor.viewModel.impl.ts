import {
  BillingDocument,
  BillingDocumentStatus,
  BillingDocumentType,
} from "@/feature/billing/types/billing.types";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BillingEditorViewModelModule,
  UseBillingEditorViewModelParams,
} from "./billingEditor.viewModel";
import {
  BillingDocumentFormState,
  BillingLineItemFormState,
} from "./billing.viewModel";
import {
  BillingDocumentEditorInternalState,
  createEmptyForm,
  createEmptyLineItem,
  mapDocumentToEditorForm,
  parseNumber,
} from "./billingViewModel.shared";

export const useBillingEditorViewModel = ({
  accountRemoteId,
  ownerUserRemoteId,
  activeTab,
  canManage,
  defaultTaxRatePercent,
  availableSettlementAccounts,
  runBillingDocumentIssueUseCase,
  onRefresh,
  setErrorMessage,
  validateSettlementAccountForPaidNow,
  runPostIssuePayment,
}: UseBillingEditorViewModelParams): BillingEditorViewModelModule => {
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [form, setForm] = useState<BillingDocumentEditorInternalState>(
    createEmptyForm(defaultTaxRatePercent),
  );

  const draftTotals = useMemo(() => {
    const subtotalAmount = Number(
      form.items
        .reduce(
          (sum, item) =>
            sum + parseNumber(item.quantity) * parseNumber(item.unitRate),
          0,
        )
        .toFixed(2),
    );
    const taxAmount = Number(
      ((subtotalAmount * parseNumber(form.taxRatePercent)) / 100).toFixed(2),
    );
    const totalAmount = Number((subtotalAmount + taxAmount).toFixed(2));

    return {
      subtotalAmount,
      taxAmount,
      totalAmount,
    };
  }, [form.items, form.taxRatePercent]);

  useEffect(() => {
    if (!isEditorVisible) {
      setForm(createEmptyForm(defaultTaxRatePercent));
    }
  }, [defaultTaxRatePercent, isEditorVisible]);

  useEffect(() => {
    setForm((currentForm) => {
      if (currentForm.settlementAccountRemoteId.trim().length > 0) {
        return currentForm;
      }

      return {
        ...currentForm,
        settlementAccountRemoteId: availableSettlementAccounts[0]?.remoteId ?? "",
      };
    });
  }, [availableSettlementAccounts]);

  const editorTitle = useMemo(() => {
    const prefix =
      form.documentType === BillingDocumentType.Invoice ? "Invoice" : "Receipt";
    return form.remoteId ? `Edit ${prefix}` : `Create ${prefix}`;
  }, [form.documentType, form.remoteId]);

  const editorForm = useMemo<BillingDocumentFormState>(
    () => ({
      documentType: form.documentType,
      customerName: form.customerName,
      taxRatePercent: form.taxRatePercent,
      notes: form.notes,
      issuedAt: form.issuedAt,
      dueAt: form.dueAt,
      paidNowAmount: form.paidNowAmount,
      settlementAccountRemoteId: form.settlementAccountRemoteId,
      items: form.items,
    }),
    [form],
  );

  const onOpenCreate = useCallback(() => {
    const nextDocumentType =
      activeTab === "receipts"
        ? BillingDocumentType.Receipt
        : BillingDocumentType.Invoice;

    const baseForm = createEmptyForm(defaultTaxRatePercent);
    setForm({
      ...baseForm,
      documentType: nextDocumentType,
      items: [createEmptyLineItem()],
      issuedAt: new Date().toISOString().slice(0, 10),
      dueAt: "",
      paidNowAmount: "0",
      settlementAccountRemoteId: availableSettlementAccounts[0]?.remoteId ?? "",
    });
    setErrorMessage(null);
    setIsEditorVisible(true);
  }, [
    activeTab,
    availableSettlementAccounts,
    defaultTaxRatePercent,
    setErrorMessage,
  ]);

  const onOpenEdit = useCallback(
    (document: BillingDocument) => {
      setForm({
        ...mapDocumentToEditorForm(document),
        settlementAccountRemoteId:
          availableSettlementAccounts[0]?.remoteId ?? "",
      });
      setErrorMessage(null);
      setIsEditorVisible(true);
    },
    [availableSettlementAccounts, setErrorMessage],
  );

  const onCloseEditor = useCallback(() => {
    setIsEditorVisible(false);
    setForm(createEmptyForm(defaultTaxRatePercent));
  }, [defaultTaxRatePercent]);

  const onFormChange = useCallback(
    (field: keyof Omit<BillingDocumentFormState, "items">, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const onLineItemChange = useCallback(
    (
      remoteId: string,
      field: keyof BillingLineItemFormState,
      value: string,
    ) => {
      setForm((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.remoteId === remoteId ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [],
  );

  const onAddLineItem = useCallback(() => {
    setForm((current) => ({
      ...current,
      items: [...current.items, createEmptyLineItem()],
    }));
  }, []);

  const onRemoveLineItem = useCallback((remoteId: string) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length > 1
          ? current.items.filter((item) => item.remoteId !== remoteId)
          : current.items,
    }));
  }, []);

  const onSubmit = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage billing.");
      return;
    }

    if (!accountRemoteId) {
      setErrorMessage("A business account is required to manage billing.");
      return;
    }

    const normalizedItems = form.items
      .map((item, index) => ({
        remoteId: item.remoteId || Crypto.randomUUID(),
        itemName: item.itemName.trim(),
        quantity: parseNumber(item.quantity),
        unitRate: parseNumber(item.unitRate),
        lineOrder: index,
      }))
      .filter((item) => item.itemName.length > 0);

    if (!form.customerName.trim()) {
      setErrorMessage("Customer name is required.");
      return;
    }

    if (normalizedItems.length === 0) {
      setErrorMessage("Add at least one item.");
      return;
    }

    if (normalizedItems.some((item) => item.quantity <= 0)) {
      setErrorMessage("Item quantity must be greater than zero.");
      return;
    }

    const paidNowAmount = Number(parseNumber(form.paidNowAmount).toFixed(2));
    if (paidNowAmount < 0) {
      setErrorMessage("Paid amount cannot be negative.");
      return;
    }

    if (paidNowAmount > draftTotals.totalAmount + 0.0001) {
      setErrorMessage("Paid amount cannot be greater than total amount.");
      return;
    }

    const settlementValidationError = validateSettlementAccountForPaidNow({
      paidNowAmount,
      settlementAccountRemoteId: form.settlementAccountRemoteId,
    });
    if (settlementValidationError) {
      setErrorMessage(settlementValidationError);
      return;
    }

    if (form.status === BillingDocumentStatus.Draft && paidNowAmount > 0) {
      setErrorMessage("Draft billing documents cannot take payment.");
      return;
    }

    const pendingAfterPayment = Number(
      Math.max(draftTotals.totalAmount - paidNowAmount, 0).toFixed(2),
    );

    const issuedAt = new Date(form.issuedAt || new Date().toISOString()).getTime();
    const normalizedIssuedAt = Number.isFinite(issuedAt) ? issuedAt : Date.now();
    const dueAt =
      form.dueAt.trim().length > 0 ? new Date(form.dueAt).getTime() : null;

    if (
      form.dueAt.trim().length > 0 &&
      (!Number.isFinite(dueAt) || dueAt === null)
    ) {
      setErrorMessage("Enter a valid due date in YYYY-MM-DD format.");
      return;
    }

    if (
      form.status !== BillingDocumentStatus.Draft &&
      pendingAfterPayment > 0 &&
      dueAt === null
    ) {
      setErrorMessage("Due date is required when pending amount exists.");
      return;
    }

    const resolvedRemoteId = form.remoteId ?? Crypto.randomUUID();
    const issueResult = await runBillingDocumentIssueUseCase.execute({
      remoteId: resolvedRemoteId,
      accountRemoteId,
      ownerUserRemoteId,
      documentType: form.documentType,
      desiredStatus: form.status,
      customerName: form.customerName,
      taxRatePercent: parseNumber(form.taxRatePercent),
      notes: form.notes.trim() || null,
      issuedAt: normalizedIssuedAt,
      dueAt:
        form.status === BillingDocumentStatus.Draft
          ? null
          : pendingAfterPayment > 0
            ? dueAt
            : null,
      items: normalizedItems,
    });

    if (!issueResult.success) {
      setErrorMessage(issueResult.error.message);
      return;
    }

    if (paidNowAmount > 0) {
      const paymentSucceeded = await runPostIssuePayment({
        billingDocumentRemoteId: issueResult.value.remoteId,
        documentNumber: issueResult.value.documentNumber,
        documentType: form.documentType,
        amount: paidNowAmount,
        settledAt: normalizedIssuedAt,
        note: form.notes.trim() || null,
        settlementAccountRemoteId: form.settlementAccountRemoteId,
      });

      if (!paymentSucceeded) {
        return;
      }
    }

    setIsEditorVisible(false);
    setForm(createEmptyForm(defaultTaxRatePercent));
    await onRefresh();
    setErrorMessage(null);
  }, [
    accountRemoteId,
    canManage,
    defaultTaxRatePercent,
    draftTotals.totalAmount,
    form,
    onRefresh,
    ownerUserRemoteId,
    runBillingDocumentIssueUseCase,
    runPostIssuePayment,
    setErrorMessage,
    validateSettlementAccountForPaidNow,
  ]);

  return useMemo(
    () => ({
      isEditorVisible,
      editorTitle,
      form: editorForm,
      draftTotals,
      onOpenCreate,
      onOpenEdit,
      onCloseEditor,
      onFormChange,
      onLineItemChange,
      onAddLineItem,
      onRemoveLineItem,
      onSubmit,
    }),
    [
      draftTotals,
      editorForm,
      editorTitle,
      isEditorVisible,
      onAddLineItem,
      onCloseEditor,
      onFormChange,
      onLineItemChange,
      onOpenCreate,
      onOpenEdit,
      onRemoveLineItem,
      onSubmit,
    ],
  );
};
