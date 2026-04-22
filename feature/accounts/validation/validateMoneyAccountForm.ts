import {
  MoneyAccountFormFieldErrors,
} from "@/feature/accounts/viewModel/moneyAccounts.viewModel";

type ValidateMoneyAccountFormParams = {
  mode: "create" | "edit";
  name: string;
  balance: string;
};

const parseNumberInput = (value: string): number | null => {
  const normalizedValue = value.trim().replace(/,/g, "");
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const validateMoneyAccountForm = ({
  mode,
  name,
  balance,
}: ValidateMoneyAccountFormParams): MoneyAccountFormFieldErrors => {
  const nextFieldErrors: MoneyAccountFormFieldErrors = {};
  const normalizedName = name.trim();
  const normalizedBalance = balance.trim();

  if (!normalizedName) {
    nextFieldErrors.name = "Account name is required.";
  }

  if (mode === "create") {
    if (!normalizedBalance) {
      nextFieldErrors.balance = "Opening balance is required.";
    } else {
      const parsedBalance = parseNumberInput(balance);
      if (parsedBalance === null) {
        nextFieldErrors.balance = "Opening balance must be a valid number.";
      } else if (parsedBalance < 0) {
        nextFieldErrors.balance = "Opening balance cannot be negative.";
      }
    }
  }

  return nextFieldErrors;
};
