import {
  Contact,
} from "@/feature/contacts/types/contact.types";
import { SaveContactUseCase } from "@/feature/contacts/useCase/saveContact.useCase";
import {
  ContactFormFieldErrors,
  ContactFormState,
} from "@/feature/contacts/viewModel/contacts.viewModel";
import {
  parseContactOpeningBalanceInput,
  validateContactForm,
} from "@/feature/contacts/validation/validateContactForm";
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
  setFormFieldErrors: (fieldErrors: ContactFormFieldErrors) => void;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setContacts: Dispatch<SetStateAction<readonly Contact[]>>;
  resetEditorAfterSubmit: () => void;
  loadContacts: () => Promise<void>;
};

type ContactSubmitStateSlice = {
  onSubmit: () => Promise<void>;
};

export const useContactSubmitState = ({
  canManage,
  ownerUserRemoteId,
  accountRemoteId,
  accountType,
  form,
  saveContactUseCase,
  setFormFieldErrors,
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

    const nextFieldErrors = validateContactForm({
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      openingBalance: form.openingBalance,
    });

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFormFieldErrors(nextFieldErrors);
      setErrorMessage(null);
      return;
    }

    const parsedOpeningBalance = parseContactOpeningBalanceInput(
      form.openingBalance,
    );

    if (!parsedOpeningBalance) {
      setFormFieldErrors({
        openingBalance:
          "Opening balance is invalid. Use a positive amount for receive or a negative amount for pay.",
      });
      setErrorMessage(null);
      return;
    }

    setFormFieldErrors({});

    const result = await saveContactUseCase.execute({
      remoteId: form.remoteId ?? Crypto.randomUUID(),
      ownerUserRemoteId,
      accountRemoteId,
      accountType,
      contactType: form.contactType,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      emailAddress: form.emailAddress.trim() || null,
      address: form.address.trim() || null,
      taxId: form.taxId.trim() || null,
      openingBalanceAmount: parsedOpeningBalance.amount,
      openingBalanceDirection: parsedOpeningBalance.direction,
      notes: form.notes.trim() || null,
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
    setFormFieldErrors,
  ]);

  return {
    onSubmit,
  };
};
