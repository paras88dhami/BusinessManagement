import { OrderMoneyFormFieldErrors } from "@/feature/orders/types/order.state.types";

type ValidateOrderMoneyFormParams = {
  amount: string;
  happenedAt: string;
  settlementMoneyAccountRemoteId: string;
  selectedMoneyAccountExists: boolean;
};

const parseAmount = (value: string): number | null => {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
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

export const validateOrderMoneyForm = ({
  amount,
  happenedAt,
  settlementMoneyAccountRemoteId,
  selectedMoneyAccountExists,
}: ValidateOrderMoneyFormParams): OrderMoneyFormFieldErrors => {
  const nextFieldErrors: OrderMoneyFormFieldErrors = {};

  const parsedAmount = parseAmount(amount);
  if (parsedAmount === null) {
    nextFieldErrors.amount = "Amount is required.";
  } else if (parsedAmount <= 0) {
    nextFieldErrors.amount = "Amount must be greater than zero.";
  }

  if (parseDateInput(happenedAt) === null) {
    nextFieldErrors.happenedAt = "Enter a valid date in YYYY-MM-DD format.";
  }

  if (!settlementMoneyAccountRemoteId.trim() || !selectedMoneyAccountExists) {
    nextFieldErrors.settlementMoneyAccountRemoteId =
      "Choose a valid money account.";
  }

  return nextFieldErrors;
};

export const parseOrderMoneyDateInput = parseDateInput;
