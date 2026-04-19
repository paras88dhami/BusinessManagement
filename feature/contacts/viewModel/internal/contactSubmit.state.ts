import {
  Contact,
  ContactBalanceDirection,
} from "@/feature/contacts/types/contact.types";
import { SaveContactUseCase } from "@/feature/contacts/useCase/saveContact.useCase";
import { ContactFormState } from "@/feature/contacts/viewModel/contacts.viewModel";
import {
  AccountTypeValue,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
import * as Crypto from "expo-crypto";
import { Dispatch, SetStateAction, useCallback } from "react";

type UseContactSubmitStateParams = {
  canManage: boolean;
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
  accountType: AccountTypeValue | null;
  form: ContactFormState;
  saveContactUseCase: SaveContactUseCase;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setContacts: Dispatch<SetStateAction<readonly Contact[]>>;
  resetEditorAfterSubmit: () => void;
  loadContacts: () => Promise<void>;
};

type ContactSubmitStateSlice = {
  onSubmit: () => Promise<void>;
};

const parseOpeningBalance = (value: string): {
  amount: number;
  direction: Contact["openingBalanceDirection"];
} | null => {
  const normalizedValue = value.trim();
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

export const useContactSubmitState = ({
  canManage,
  ownerUserRemoteId,
  accountRemoteId,
  accountType,
  form,
  saveContactUseCase,
  setErrorMessage,
  setContacts,
  resetEditorAfterSubmit,
  loadContacts,
}: UseContactSubmitStateParams): ContactSubmitStateSlice => {
  const onSubmit = useCallback(async () => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage contacts.");
      return;
    }

    if (!ownerUserRemoteId || !accountRemoteId || !accountType) {
      setErrorMessage("An active account is required to manage contacts.");
      return;
    }

    const normalizedPhoneNumber = form.phoneNumber.trim();
    if (!normalizedPhoneNumber) {
      setErrorMessage("Phone number is required for contacts.");
      return;
    }

    const parsedOpeningBalance = parseOpeningBalance(form.openingBalance);
    if (!parsedOpeningBalance) {
      setErrorMessage(
        "Opening balance is invalid. Use a positive amount for receive or a negative amount for pay.",
      );
      return;
    }

    const result = await saveContactUseCase.execute({
      remoteId: form.remoteId ?? Crypto.randomUUID(),
      ownerUserRemoteId,
      accountRemoteId,
      accountType,
      contactType: form.contactType,
      fullName: form.fullName,
      phoneNumber: normalizedPhoneNumber,
      emailAddress: form.emailAddress || null,
      address: form.address || null,
      taxId: form.taxId || null,
      openingBalanceAmount: parsedOpeningBalance.amount,
      openingBalanceDirection: parsedOpeningBalance.direction,
      notes: form.notes || null,
      isArchived: false,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setContacts((currentContacts) => {
      const existingIndex = currentContacts.findIndex(
        (contact) => contact.remoteId === result.value.remoteId,
      );
      if (existingIndex === -1) {
        return [result.value, ...currentContacts];
      }
      return currentContacts.map((contact, index) =>
        index === existingIndex ? result.value : contact,
      );
    });
    setErrorMessage(null);
    resetEditorAfterSubmit();
    void loadContacts();
  }, [
    accountRemoteId,
    accountType,
    canManage,
    form,
    loadContacts,
    ownerUserRemoteId,
    resetEditorAfterSubmit,
    saveContactUseCase,
    setContacts,
    setErrorMessage,
  ]);

  return {
    onSubmit,
  };
};
