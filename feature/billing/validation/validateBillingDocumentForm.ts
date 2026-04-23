import {
  BillingDocumentStatus,
  BillingDocumentStatusValue,
} from "@/feature/billing/types/billing.types";
import {
  BillingDocumentFormFieldErrors,
  BillingLineItemFormFieldErrors,
  BillingLineItemFormState,
} from "@/feature/billing/viewModel/billing.viewModel";

type NormalizedBillingLineItem = {
  remoteId: string;
  itemName: string;
  quantity: number;
  unitRate: number;
  lineOrder: number;
};

type ValidateBillingDocumentFormParams = {
  status: BillingDocumentStatusValue;
  customerName: string;
  taxRatePercent: string;
  issuedAt: string;
  dueAt: string;
  paidNowAmount: string;
  settlementAccountRemoteId: string;
  hasSettlementAccountMatch: boolean;
  items: readonly BillingLineItemFormState[];
};

type ValidateBillingDocumentFormResult = {
  formFieldErrors: BillingDocumentFormFieldErrors;
  items: BillingLineItemFormState[];
  normalizedItems: NormalizedBillingLineItem[];
  normalizedIssuedAt: number | null;
  normalizedDueAt: number | null;
  normalizedPaidNowAmount: number;
};

const parseStrictDecimal = (value: string): number | null => {
  const normalizedValue = value.trim().replace(/,/g, "");
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const parseOptionalDecimalAsZero = (value: string): number | null => {
  const normalizedValue = value.trim().replace(/,/g, "");
  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const parseDateInput = (value: string): number | null => {
  const normalizedValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return null;
  }

  const [yearText, monthText, dayText] = normalizedValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.getTime();
};

const isBlankLine = (item: BillingLineItemFormState): boolean => {
  return (
    item.itemName.trim().length === 0 &&
    item.quantity.trim().length === 0 &&
    item.unitRate.trim().length === 0
  );
};

export const validateBillingDocumentForm = ({
  status,
  customerName,
  taxRatePercent,
  issuedAt,
  dueAt,
  paidNowAmount,
  settlementAccountRemoteId,
  hasSettlementAccountMatch,
  items,
}: ValidateBillingDocumentFormParams): ValidateBillingDocumentFormResult => {
  const formFieldErrors: BillingDocumentFormFieldErrors = {};

  if (!customerName.trim()) {
    formFieldErrors.customerName = "Customer name is required.";
  }

  const normalizedIssuedAt = parseDateInput(issuedAt);
  if (normalizedIssuedAt === null) {
    formFieldErrors.issuedAt = "Enter a valid issue date in YYYY-MM-DD format.";
  }

  const normalizedPaidNowAmount = parseOptionalDecimalAsZero(paidNowAmount);
  if (normalizedPaidNowAmount === null) {
    formFieldErrors.paidNowAmount = "Paid amount is invalid.";
  } else if (normalizedPaidNowAmount < 0) {
    formFieldErrors.paidNowAmount = "Paid amount cannot be negative.";
  }

  const parsedTaxRatePercent = parseOptionalDecimalAsZero(taxRatePercent) ?? 0;

  let lineOrder = 0;
  let subtotalAmount = 0;
  const normalizedItems: NormalizedBillingLineItem[] = [];

  const nextItems = items.map((item) => {
    if (isBlankLine(item)) {
      return {
        ...item,
        fieldErrors: {},
      };
    }

    const nextFieldErrors: BillingLineItemFormFieldErrors = {};
    const normalizedItemName = item.itemName.trim();
    const normalizedQuantity = parseStrictDecimal(item.quantity);
    const normalizedUnitRate = parseStrictDecimal(item.unitRate);

    if (!normalizedItemName) {
      nextFieldErrors.itemName = "Item name is required.";
    }

    if (normalizedQuantity === null) {
      nextFieldErrors.quantity = "Quantity is required.";
    } else if (normalizedQuantity <= 0) {
      nextFieldErrors.quantity = "Quantity must be greater than zero.";
    }

    if (normalizedUnitRate === null) {
      nextFieldErrors.unitRate = "Rate is required.";
    } else if (normalizedUnitRate < 0) {
      nextFieldErrors.unitRate = "Rate cannot be negative.";
    }

    const isValidLine =
      normalizedItemName.length > 0 &&
      normalizedQuantity !== null &&
      normalizedQuantity > 0 &&
      normalizedUnitRate !== null &&
      normalizedUnitRate >= 0;

    if (isValidLine) {
      normalizedItems.push({
        remoteId: item.remoteId,
        itemName: normalizedItemName,
        quantity: normalizedQuantity,
        unitRate: normalizedUnitRate,
        lineOrder,
      });
      lineOrder += 1;
      subtotalAmount += normalizedQuantity * normalizedUnitRate;
    }

    return {
      ...item,
      fieldErrors: nextFieldErrors,
    };
  });

  if (normalizedItems.length === 0) {
    formFieldErrors.items = "Add at least one item.";
  }

  const taxAmount = Number(
    ((subtotalAmount * parsedTaxRatePercent) / 100).toFixed(2),
  );
  const totalAmount = Number((subtotalAmount + taxAmount).toFixed(2));

  if (
    normalizedPaidNowAmount !== null &&
    normalizedPaidNowAmount > totalAmount + 0.0001
  ) {
    formFieldErrors.paidNowAmount =
      "Paid amount cannot be greater than total amount.";
  }

  if (
    status === BillingDocumentStatus.Draft &&
    normalizedPaidNowAmount !== null &&
    normalizedPaidNowAmount > 0
  ) {
    formFieldErrors.paidNowAmount =
      "Draft billing documents cannot take payment.";
  }

  if (
    normalizedPaidNowAmount !== null &&
    normalizedPaidNowAmount > 0 &&
    settlementAccountRemoteId.trim().length === 0
  ) {
    formFieldErrors.settlementAccountRemoteId =
      "Money account is required when paid amount is entered.";
  } else if (
    normalizedPaidNowAmount !== null &&
    normalizedPaidNowAmount > 0 &&
    !hasSettlementAccountMatch
  ) {
    formFieldErrors.settlementAccountRemoteId =
      "Select a valid money account.";
  }

  const dueAtTrimmed = dueAt.trim();
  const normalizedDueAt =
    dueAtTrimmed.length > 0 ? parseDateInput(dueAt) : null;

  if (dueAtTrimmed.length > 0 && normalizedDueAt === null) {
    formFieldErrors.dueAt = "Enter a valid due date in YYYY-MM-DD format.";
  }

  const pendingAfterPayment =
    normalizedPaidNowAmount === null
      ? totalAmount
      : Number(Math.max(totalAmount - normalizedPaidNowAmount, 0).toFixed(2));

  if (
    status !== BillingDocumentStatus.Draft &&
    pendingAfterPayment > 0 &&
    dueAtTrimmed.length === 0
  ) {
    formFieldErrors.dueAt = "Due date is required when pending amount exists.";
  }

  return {
    formFieldErrors,
    items: nextItems,
    normalizedItems,
    normalizedIssuedAt,
    normalizedDueAt,
    normalizedPaidNowAmount: normalizedPaidNowAmount ?? 0,
  };
};
