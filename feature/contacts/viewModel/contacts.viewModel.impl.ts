import {
  BUSINESS_CONTACT_FILTER_OPTIONS,
  BUSINESS_CONTACT_TYPE_OPTIONS,
  Contact,
  PERSONAL_CONTACT_FILTER_OPTIONS,
  PERSONAL_CONTACT_TYPE_OPTIONS,
} from "@/feature/contacts/types/contact.types";
import { ArchiveContactUseCase } from "@/feature/contacts/useCase/archiveContact.useCase";
import { GetContactsUseCase } from "@/feature/contacts/useCase/getContacts.useCase";
import { SaveContactUseCase } from "@/feature/contacts/useCase/saveContact.useCase";
import {
  AccountType,
  AccountTypeValue,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
import { useCallback, useMemo } from "react";
import { ContactsViewModel } from "./contacts.viewModel";
import { useContactArchiveState } from "./internal/contactArchive.state";
import { useContactEditorState } from "./internal/contactEditor.state";
import { useContactSubmitState } from "./internal/contactSubmit.state";
import { useContactsFilterState } from "./internal/contactsFilter.state";
import { useContactsListState } from "./internal/contactsList.state";
import { useContactsSummaryState } from "./internal/contactsSummary.state";

type UseContactsViewModelParams = {
  ownerUserRemoteId: string | null;
  accountRemoteId: string | null;
  accountType: AccountTypeValue | null;
  canManage: boolean;
  currencyCode: string | null;
  countryCode: string | null;
  getContactsUseCase: GetContactsUseCase;
  saveContactUseCase: SaveContactUseCase;
  archiveContactUseCase: ArchiveContactUseCase;
};

export const useContactsViewModel = ({
  ownerUserRemoteId,
  accountRemoteId,
  accountType,
  canManage,
  currencyCode,
  countryCode,
  getContactsUseCase,
  saveContactUseCase,
  archiveContactUseCase,
}: UseContactsViewModelParams): ContactsViewModel => {
  const filterOptions = useMemo(() => {
    return accountType === AccountType.Personal
      ? PERSONAL_CONTACT_FILTER_OPTIONS
      : BUSINESS_CONTACT_FILTER_OPTIONS;
  }, [accountType]);

  const typeOptions = useMemo(() => {
    return accountType === AccountType.Personal
      ? PERSONAL_CONTACT_TYPE_OPTIONS
      : BUSINESS_CONTACT_TYPE_OPTIONS;
  }, [accountType]);

  const listState = useContactsListState({
    accountRemoteId,
    getContactsUseCase,
  });

  const filterState = useContactsFilterState({
    contacts: listState.contacts,
    filterOptions,
  });

  const summaryState = useContactsSummaryState({
    contacts: listState.contacts,
    currencyCode,
    countryCode,
  });

  const editorState = useContactEditorState({
    canManage,
    typeOptions,
    setErrorMessage: listState.setErrorMessage,
  });

  const getEditorContext = useCallback(
    () => ({
      editorMode: editorState.editorMode,
      formRemoteId: editorState.form.remoteId,
    }),
    [editorState.editorMode, editorState.form.remoteId],
  );

  const archiveState = useContactArchiveState({
    canManage,
    accountRemoteId,
    contacts: listState.contacts,
    archiveContactUseCase,
    getEditorContext,
    setErrorMessage: listState.setErrorMessage,
    setContacts: listState.setContacts,
    loadContacts: listState.loadContacts,
    resetEditorAfterArchive: editorState.resetEditorState,
  });

  const submitState = useContactSubmitState({
    canManage,
    ownerUserRemoteId,
    accountRemoteId,
    accountType,
    form: editorState.form,
    saveContactUseCase,
    setErrorMessage: listState.setErrorMessage,
    setContacts: listState.setContacts,
    resetEditorAfterSubmit: editorState.resetEditorState,
    loadContacts: listState.loadContacts,
  });

  const onOpenCreate = useCallback(() => {
    const didOpenEditor = editorState.onOpenCreate();
    if (didOpenEditor) {
      archiveState.clearDeleteErrorMessage();
    }
  }, [archiveState.clearDeleteErrorMessage, editorState.onOpenCreate]);

  const onOpenEdit = useCallback(
    (contact: Contact) => {
      const didOpenEditor = editorState.onOpenEdit(contact);
      if (didOpenEditor) {
        archiveState.clearDeleteErrorMessage();
      }
    },
    [archiveState.clearDeleteErrorMessage, editorState.onOpenEdit],
  );

  const onCloseEditor = useCallback(() => {
    editorState.onCloseEditor();
    archiveState.clearDeleteErrorMessage();
  }, [archiveState.clearDeleteErrorMessage, editorState.onCloseEditor]);

  const canManageContacts =
    Boolean(ownerUserRemoteId && accountRemoteId && accountType) && canManage;

  return useMemo<ContactsViewModel>(
    () => ({
      isLoading: listState.isLoading,
      errorMessage: listState.errorMessage,
      contacts: listState.contacts,
      filteredContacts: filterState.filteredContacts,
      currencyPrefix: summaryState.currencyPrefix,
      openingBalancePlaceholder: summaryState.openingBalancePlaceholder,
      selectedFilter: filterState.selectedFilter,
      searchQuery: filterState.searchQuery,
      summary: summaryState.summary,
      canManage: canManageContacts,
      isEditorVisible: editorState.isEditorVisible,
      editorMode: editorState.editorMode,
      editorTitle: editorState.editorTitle,
      form: editorState.form,
      isDeleteModalVisible: archiveState.isDeleteModalVisible,
      pendingDeleteContactName: archiveState.pendingDeleteContactName,
      deleteErrorMessage: archiveState.deleteErrorMessage,
      isDeleting: archiveState.isDeleting,
      filterOptions,
      typeOptions,
      onRefresh: listState.loadContacts,
      onSearchChange: filterState.setSearchQuery,
      onFilterChange: filterState.setSelectedFilter,
      onOpenCreate,
      onOpenEdit,
      onCloseEditor,
      onFormChange: editorState.onFormChange,
      onSubmit: submitState.onSubmit,
      onRequestDeleteFromEditor: archiveState.onRequestDeleteFromEditor,
      onCloseDeleteModal: archiveState.onCloseDeleteModal,
      onConfirmDelete: archiveState.onConfirmDelete,
      getContactAmountTone: summaryState.getContactAmountTone,
    }),
    [
      archiveState.deleteErrorMessage,
      archiveState.isDeleteModalVisible,
      archiveState.isDeleting,
      archiveState.onCloseDeleteModal,
      archiveState.onConfirmDelete,
      archiveState.onRequestDeleteFromEditor,
      archiveState.pendingDeleteContactName,
      canManageContacts,
      editorState.editorMode,
      editorState.editorTitle,
      editorState.form,
      editorState.isEditorVisible,
      editorState.onFormChange,
      filterOptions,
      filterState.filteredContacts,
      filterState.searchQuery,
      filterState.selectedFilter,
      filterState.setSearchQuery,
      filterState.setSelectedFilter,
      listState.contacts,
      listState.errorMessage,
      listState.isLoading,
      listState.loadContacts,
      onCloseEditor,
      onOpenCreate,
      onOpenEdit,
      submitState.onSubmit,
      summaryState.currencyPrefix,
      summaryState.getContactAmountTone,
      summaryState.openingBalancePlaceholder,
      summaryState.summary,
      typeOptions,
    ],
  );
};
