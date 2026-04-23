import { Contact } from "@/feature/contacts/types/contact.types";
import { ContactDetailsScreenState } from "@/feature/contacts/types/contactDetails.state.types";

export interface ContactDetailsViewModel extends ContactDetailsScreenState {
  selectedContact: Contact | null;
  onOpenDetails: (contact: Contact) => Promise<void>;
  onCloseDetails: () => void;
}
