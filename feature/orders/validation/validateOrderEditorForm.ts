import {
  OrderFormFieldErrors,
  OrderFormState,
  OrderLineFormFieldErrors,
  OrderLineFormState,
} from "@/feature/orders/types/order.state.types";

type ValidateOrderEditorFormResult = {
  formFieldErrors: OrderFormFieldErrors;
  items: OrderLineFormState[];
};

const parseQuantity = (value: string): number | null => {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const isLineBlank = (item: OrderLineFormState): boolean => {
  return item.productRemoteId.trim().length === 0 && item.quantity.trim().length === 0;
};

export const validateOrderEditorForm = (
  form: OrderFormState,
): ValidateOrderEditorFormResult => {
  const formItems = Array.isArray(form.items) ? form.items : [];
  const formFieldErrors: OrderFormFieldErrors = {};

  let validLineCount = 0;

  const items = formItems.map((item) => {
    const nextFieldErrors: OrderLineFormFieldErrors = {};
    const trimmedProductRemoteId = item.productRemoteId.trim();
    const parsedQuantity = parseQuantity(item.quantity);

    if (isLineBlank(item)) {
      return {
        ...item,
        fieldErrors: {},
      };
    }

    if (!trimmedProductRemoteId) {
      nextFieldErrors.productRemoteId = "Select an item.";
    }

    if (parsedQuantity === null) {
      nextFieldErrors.quantity = "Enter quantity.";
    } else if (parsedQuantity <= 0) {
      nextFieldErrors.quantity = "Quantity must be greater than zero.";
    }

    if (trimmedProductRemoteId && parsedQuantity !== null && parsedQuantity > 0) {
      validLineCount += 1;
    }

    return {
      ...item,
      fieldErrors: nextFieldErrors,
    };
  });

  if (validLineCount === 0) {
    formFieldErrors.items = "Add at least one order item.";
  }

  return {
    formFieldErrors,
    items,
  };
};
