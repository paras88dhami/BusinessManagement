import {
  Contact,
  ContactBalanceDirection,
  ContactType,
  ContactTypeValue,
} from "@/feature/contacts/types/contact.types";
import { ContactFormState } from "@/feature/contacts/viewModel/contacts.viewModel";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

type ContactTypeOption = Readonly<{
  value: ContactTypeValue;
  label: string;
}>;

type UseContactEditorStateParams = {
  canManage: boolean;
  typeOptions: readonly ContactTypeOption[];
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
};

type ContactEditorStateSlice = {
  isEditorVisible: boolean;
  editorMode: "create" | "edit";
  editorTitle: string;
  form: ContactFormState;
  onOpenCreate: () => boolean;
  onOpenEdit: (contact: Contact) => boolean;
  onCloseEditor: () => void;
  onFormChange: (field: keyof ContactFormState, value: string) => void;
  resetEditorState: () => void;
};

const EMPTY_FORM: ContactFormState = {
  remoteId: null,
  fullName: "",
  contactType: ContactType.Customer,
  phoneNumber: "",
  emailAddress: "",
  address: "",
  taxId: "",
  openingBalance: "0",
  notes: "",
};

const formatSignedOpeningBalance = (contact: Contact): string => {
  if (!contact.openingBalanceAmount) {
    return "";
  }

  return contact.openingBalanceDirection === ContactBalanceDirection.Pay
    ? `-${contact.openingBalanceAmount}`
    : `${contact.openingBalanceAmount}`;
};

const mapContactToForm = (contact: Contact): ContactFormState => ({
  remoteId: contact.remoteId,
  fullName: contact.fullName,
  contactType: contact.contactType,
  phoneNumber: contact.phoneNumber ?? "",
  emailAddress: contact.emailAddress ?? "",
  address: contact.address ?? "",
  taxId: contact.taxId ?? "",
  openingBalance: formatSignedOpeningBalance(contact),
  notes: contact.notes ?? "",
});

export const useContactEditorState = ({
  canManage,
  typeOptions,
  setErrorMessage,
}: UseContactEditorStateParams): ContactEditorStateSlice => {
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);

  const onOpenCreate = useCallback((): boolean => {
    if (!canManage) {
      setErrorMessage("You do not have permission to manage contacts.");
      return false;
    }

    const defaultType = typeOptions[0]?.value ?? ContactType.Customer;
    setEditorMode("create");
    setForm({
      ...EMPTY_FORM,
      contactType: defaultType,
    });
    setErrorMessage(null);
    setIsEditorVisible(true);
    return true;
  }, [canManage, setErrorMessage, typeOptions]);

  const onOpenEdit = useCallback(
    (contact: Contact): boolean => {
      if (!canManage) {
        setErrorMessage("You do not have permission to manage contacts.");
        return false;
      }

      setEditorMode("edit");
      setForm(mapContactToForm(contact));
      setErrorMessage(null);
      setIsEditorVisible(true);
      return true;
    },
    [canManage, setErrorMessage],
  );

  const resetEditorState = useCallback(() => {
    setIsEditorVisible(false);
    setForm(EMPTY_FORM);
  }, []);

  const onCloseEditor = useCallback(() => {
    resetEditorState();
  }, [resetEditorState]);

  const onFormChange = useCallback((field: keyof ContactFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const editorTitle = useMemo(
    () => (editorMode === "create" ? "New Contact" : "Edit Contact"),
    [editorMode],
  );

  return {
    isEditorVisible,
    editorMode,
    editorTitle,
    form,
    onOpenCreate,
    onOpenEdit,
    onCloseEditor,
    onFormChange,
    resetEditorState,
  };
};
