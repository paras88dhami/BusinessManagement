import {
  ContactBalanceDirection,
  ContactBalanceDirectionValue,
} from "@/feature/contacts/types/contact.types";
import {
  ContactFormFieldErrors,
} from "@/feature/contacts/viewModel/contacts.viewModel";

export type ParsedContactOpeningBalance = {
  amount: number;
  direction: ContactBalanceDirectionValue | null;
};

export const parseContactOpeningBalanceInput = (
  value: string,
): ParsedContactOpeningBalance | null => {
  const normalizedValue = value.trim().replace(/,/g, "");

  if (!normalizedValue) {
    return {
      amount: 0,
      direction: null,
    };
  }

  const parsedValue = Number(normalizedValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  if (parsedValue === 0) {
    return {
      amount: 0,
      direction: null,
    };
  }

  return {
    amount: Math.abs(parsedValue),
    direction:
      parsedValue > 0
        ? ContactBalanceDirection.Receive
        : ContactBalanceDirection.Pay,
  };
};

type ValidateContactFormParams = {
  fullName: string;
  phoneNumber: string;
  openingBalance: string;
};

export const validateContactForm = ({
  fullName,
  phoneNumber,
  openingBalance,
}: ValidateContactFormParams): ContactFormFieldErrors => {
  const nextFieldErrors: ContactFormFieldErrors = {};

  if (!fullName.trim()) {
    nextFieldErrors.fullName = "Full name is required.";
  }

  if (!phoneNumber.trim()) {
    nextFieldErrors.phoneNumber = "Phone number is required.";
  }

  if (parseContactOpeningBalanceInput(openingBalance) === null) {
    nextFieldErrors.openingBalance =
      "Opening balance is invalid. Use a positive amount for receive or a negative amount for pay.";
  }

  return nextFieldErrors;
};
