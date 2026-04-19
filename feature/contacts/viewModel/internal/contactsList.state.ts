import { Contact } from "@/feature/contacts/types/contact.types";
import { GetContactsUseCase } from "@/feature/contacts/useCase/getContacts.useCase";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

type UseContactsListStateParams = {
  accountRemoteId: string | null;
  getContactsUseCase: GetContactsUseCase;
};

type ContactsListState = {
  isLoading: boolean;
  errorMessage: string | null;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  contacts: readonly Contact[];
  setContacts: Dispatch<SetStateAction<readonly Contact[]>>;
  loadContacts: () => Promise<void>;
};

export const useContactsListState = ({
  accountRemoteId,
  getContactsUseCase,
}: UseContactsListStateParams): ContactsListState => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contacts, setContacts] = useState<readonly Contact[]>([]);

  const loadContacts = useCallback(async (): Promise<void> => {
    if (!accountRemoteId) {
      setContacts([]);
      setErrorMessage("An active account is required to manage contacts.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await getContactsUseCase.execute({
      accountRemoteId,
    });

    if (!result.success) {
      setContacts([]);
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    setContacts(result.value);
    setErrorMessage(null);
    setIsLoading(false);
  }, [accountRemoteId, getContactsUseCase]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  return {
    isLoading,
    errorMessage,
    setErrorMessage,
    contacts,
    setContacts,
    loadContacts,
  };
};
