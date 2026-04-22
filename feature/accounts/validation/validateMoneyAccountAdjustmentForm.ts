import {
  MoneyAccountAdjustmentFieldErrors,
} from "@/feature/accounts/viewModel/moneyAccounts.viewModel";

type ValidateMoneyAccountAdjustmentFormParams = {
  targetBalance: string;
  reason: string;
};

const parseNumberInput = (value: string): number | null => {
  const normalizedValue = value.trim().replace(/,/g, "");
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const validateMoneyAccountAdjustmentForm = ({
  targetBalance,
  reason,
}: ValidateMoneyAccountAdjustmentFormParams): MoneyAccountAdjustmentFieldErrors => {
  const nextFieldErrors: MoneyAccountAdjustmentFieldErrors = {};
  const normalizedTargetBalance = targetBalance.trim();
  const normalizedReason = reason.trim();

  if (!normalizedTargetBalance) {
    nextFieldErrors.targetBalance = "Correct balance is required.";
  } else {
    const parsedTargetBalance = parseNumberInput(targetBalance);
    if (parsedTargetBalance === null) {
      nextFieldErrors.targetBalance =
        "Correct balance must be a valid number.";
    } else if (parsedTargetBalance < 0) {
      nextFieldErrors.targetBalance =
        "Correct balance must be zero or greater.";
    }
  }

  if (!normalizedReason) {
    nextFieldErrors.reason = "Reason is required.";
  }

  return nextFieldErrors;
};
