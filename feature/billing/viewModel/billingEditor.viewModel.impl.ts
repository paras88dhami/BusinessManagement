import {
  BillingDocument,
  BillingDocumentStatus,
  BillingDocumentType,
} from "@/feature/billing/types/billing.types";
import { validateBillingDocumentForm } from "@/feature/billing/validation/validateBillingDocumentForm";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BillingEditorViewModelModule,
  UseBillingEditorViewModelParams,
} from "./billingEditor.viewModel";
import {
  BillingDocumentFormState,
  BillingDocumentFormFieldErrors,
  BillingLineItemFormFieldErrors,
  BillingLineItemFormState,
} from "./billing.viewModel";
import {
  BillingDocumentEditorInternalState,
  createEmptyForm,
  createEmptyLineItem,
  mapDocumentToEditorForm,
  parseNumber,
} from "./billingViewModel.shared";

const clearFormFieldError = (
  fieldErrors: BillingDocumentFormFieldErrors,
  field: keyof BillingDocumentFormFieldErrors,
): BillingDocumentFormFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

const clearLineFieldError = (
  fieldErrors: BillingLineItemFormFieldErrors,
  field: keyof BillingLineItemFormFieldErrors,
): BillingLineItemFormFieldErrors => {
  if (!fieldErrors[field]) {
    return fieldErrors;
  }

  return {
    ...fieldErrors,
    [field]: undefined,
  };
};

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
        settlementAccountRemoteId:
          availableSettlementAccounts[0]?.remoteId ?? "",
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
      fieldErrors: form.fieldErrors,
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
      fieldErrors: {},
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
    (
      field: keyof Omit<BillingDocumentFormState, "items" | "fieldErrors">,
      value: string,
    ) => {
      setErrorMessage(null);
      setForm((current) => {
        let nextFieldErrors = current.fieldErrors;

        if (field === "customerName") {
          nextFieldErrors = clearFormFieldError(current.fieldErrors, "customerName");
        } else if (field === "issuedAt") {
          nextFieldErrors = clearFormFieldError(current.fieldErrors, "issuedAt");
        } else if (field === "dueAt") {
          nextFieldErrors = clearFormFieldError(current.fieldErrors, "dueAt");
        } else if (field === "paidNowAmount") {
          nextFieldErrors = clearFormFieldError(
            current.fieldErrors,
            "paidNowAmount",
          );
        } else if (field === "settlementAccountRemoteId") {
          nextFieldErrors = clearFormFieldError(
            current.fieldErrors,
            "settlementAccountRemoteId",
          );
        }

        return {
          ...current,
          [field]: value,
          fieldErrors: nextFieldErrors,
        };
      });
    },
    [setErrorMessage],
  );

  const onLineItemChange = useCallback(
    (
      remoteId: string,
      field: keyof Omit<BillingLineItemFormState, "fieldErrors">,
      value: string,
    ) => {
      setErrorMessage(null);
      setForm((current) => ({
        ...current,
        fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
        items: current.items.map((item) =>
          item.remoteId === remoteId
            ? {
                ...item,
                [field]: value,
                fieldErrors:
                  field === "itemName"
                    ? clearLineFieldError(item.fieldErrors, "itemName")
                    : field === "quantity"
                      ? clearLineFieldError(item.fieldErrors, "quantity")
                      : field === "unitRate"
                        ? clearLineFieldError(item.fieldErrors, "unitRate")
                        : item.fieldErrors,
              }
            : item,
        ),
      }));
    },
    [setErrorMessage],
  );

  const onAddLineItem = useCallback(() => {
    setErrorMessage(null);
    setForm((current) => ({
      ...current,
      fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
      items: [...current.items, createEmptyLineItem()],
    }));
  }, [setErrorMessage]);

  const onRemoveLineItem = useCallback((remoteId: string) => {
    setErrorMessage(null);
    setForm((current) => ({
      ...current,
      fieldErrors: clearFormFieldError(current.fieldErrors, "items"),
      items:
        current.items.length > 1
          ? current.items.filter((item) => item.remoteId !== remoteId)
          : current.items,
    }));
  }, [setErrorMessage]);

  const onSubmit = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage billing.");
      return;
    }

    if (!accountRemoteId) {
      setErrorMessage("A business account is required to manage billing.");
      return;
    }

    const hasSettlementAccountMatch = availableSettlementAccounts.some(
      (account) => account.remoteId === form.settlementAccountRemoteId.trim(),
    );

    const validationResult = validateBillingDocumentForm({
      status: form.status,
      customerName: form.customerName,
      taxRatePercent: form.taxRatePercent,
      issuedAt: form.issuedAt,
      dueAt: form.dueAt,
      paidNowAmount: form.paidNowAmount,
      settlementAccountRemoteId: form.settlementAccountRemoteId,
      hasSettlementAccountMatch,
      items: form.items,
    });

    const hasLineErrors = validationResult.items.some((item) =>
      Object.values(item.fieldErrors).some(Boolean),
    );
    const hasFormErrors = Object.values(validationResult.formFieldErrors).some(Boolean);

    if (hasFormErrors || hasLineErrors) {
      setForm((current) => ({
        ...current,
        fieldErrors: validationResult.formFieldErrors,
        items: validationResult.items,
      }));
      setErrorMessage(null);
      return;
    }

    const normalizedItems = validationResult.normalizedItems.map((item, index) => ({
      remoteId: item.remoteId || Crypto.randomUUID(),
      itemName: item.itemName,
      quantity: item.quantity,
      unitRate: item.unitRate,
      lineOrder: index,
    }));

    const issueResult = await runBillingDocumentIssueUseCase.execute({
      remoteId: form.remoteId ?? Crypto.randomUUID(),
      accountRemoteId,
      ownerUserRemoteId,
      documentType: form.documentType,
      desiredStatus: form.status,
      customerName: form.customerName.trim(),
      taxRatePercent: parseNumber(form.taxRatePercent),
      notes: form.notes.trim() || null,
      issuedAt: validationResult.normalizedIssuedAt ?? Date.now(),
      dueAt:
        form.status === BillingDocumentStatus.Draft
          ? null
          : validationResult.normalizedDueAt,
      items: normalizedItems,
    });

    if (!issueResult.success) {
      setErrorMessage(issueResult.error.message);
      return;
    }

    if (validationResult.normalizedPaidNowAmount > 0) {
      const paymentSucceeded = await runPostIssuePayment({
        billingDocumentRemoteId: issueResult.value.remoteId,
        documentNumber: issueResult.value.documentNumber,
        documentType: form.documentType,
        amount: validationResult.normalizedPaidNowAmount,
        settledAt: validationResult.normalizedIssuedAt ?? Date.now(),
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
    availableSettlementAccounts,
    canManage,
    defaultTaxRatePercent,
    form,
    onRefresh,
    ownerUserRemoteId,
    runBillingDocumentIssueUseCase,
    runPostIssuePayment,
    setErrorMessage,
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
