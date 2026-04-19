import { Contact } from "@/feature/contacts/types/contact.types";
import { ArchiveContactUseCase } from "@/feature/contacts/useCase/archiveContact.useCase";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

type EditorContext = {
  editorMode: "create" | "edit";
  formRemoteId: string | null;
};

type UseContactArchiveStateParams = {
  canManage: boolean;
  accountRemoteId: string | null;
  contacts: readonly Contact[];
  archiveContactUseCase: ArchiveContactUseCase;
  getEditorContext: () => EditorContext;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setContacts: Dispatch<SetStateAction<readonly Contact[]>>;
  loadContacts: () => Promise<void>;
  resetEditorAfterArchive: () => void;
};

type ContactArchiveStateSlice = {
  isDeleteModalVisible: boolean;
  pendingDeleteContactName: string | null;
  deleteErrorMessage: string | null;
  isDeleting: boolean;
  onRequestDeleteFromEditor: () => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => Promise<void>;
  clearDeleteErrorMessage: () => void;
};

export const useContactArchiveState = ({
  canManage,
  accountRemoteId,
  contacts,
  archiveContactUseCase,
  getEditorContext,
  setErrorMessage,
  setContacts,
  loadContacts,
  resetEditorAfterArchive,
}: UseContactArchiveStateParams): ContactArchiveStateSlice => {
  const [pendingDeleteRemoteId, setPendingDeleteRemoteId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const clearDeleteErrorMessage = useCallback(() => {
    setDeleteErrorMessage(null);
  }, []);

  const onRequestDeleteFromEditor = useCallback((): void => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage contacts.");
      return;
    }

    const { editorMode, formRemoteId } = getEditorContext();
    if (editorMode !== "edit" || !formRemoteId) {
      return;
    }

    const targetContact = contacts.find((contact) => contact.remoteId === formRemoteId);
    if (!targetContact) {
      setErrorMessage("Contact not found.");
      return;
    }

    setPendingDeleteRemoteId(targetContact.remoteId);
    setDeleteErrorMessage(null);
  }, [canManage, contacts, getEditorContext, setErrorMessage]);

  const onCloseDeleteModal = useCallback((): void => {
    if (isDeleting) {
      return;
    }
    setPendingDeleteRemoteId(null);
    setDeleteErrorMessage(null);
  }, [isDeleting]);

  const onConfirmDelete = useCallback(async (): Promise<void> => {
    if (!canManage) {
      setDeleteErrorMessage("You do not have permission to manage contacts.");
      return;
    }

    if (!pendingDeleteRemoteId) {
      return;
    }

    if (!accountRemoteId) {
      setDeleteErrorMessage("An active account is required to manage contacts.");
      return;
    }

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    const archiveContactResult = await archiveContactUseCase.execute({
      remoteId: pendingDeleteRemoteId,
      accountRemoteId,
    });
    setIsDeleting(false);

    if (!archiveContactResult.success) {
      setDeleteErrorMessage(archiveContactResult.error.message);
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.remoteId !== pendingDeleteRemoteId),
    );
    setPendingDeleteRemoteId(null);
    setDeleteErrorMessage(null);
    setErrorMessage(null);
    resetEditorAfterArchive();
    void loadContacts();
  }, [
    accountRemoteId,
    archiveContactUseCase,
    canManage,
    loadContacts,
    pendingDeleteRemoteId,
    resetEditorAfterArchive,
    setContacts,
    setErrorMessage,
  ]);

  const pendingDeleteContactName = useMemo(() => {
    if (!pendingDeleteRemoteId) {
      return null;
    }

    const pendingContact = contacts.find(
      (contact) => contact.remoteId === pendingDeleteRemoteId,
    );
    return pendingContact?.fullName ?? null;
  }, [contacts, pendingDeleteRemoteId]);

  return {
    isDeleteModalVisible: Boolean(pendingDeleteRemoteId),
    pendingDeleteContactName,
    deleteErrorMessage,
    isDeleting,
    onRequestDeleteFromEditor,
    onCloseDeleteModal,
    onConfirmDelete,
    clearDeleteErrorMessage,
  };
};
