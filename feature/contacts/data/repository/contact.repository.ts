import {
  ContactOperationResult,
  ContactResult,
  ContactsResult,
  ContactScopedReference,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";

export interface ContactRepository {
  getContactsByAccountRemoteId(accountRemoteId: string): Promise<ContactsResult>;
  getContactByRemoteId(reference: ContactScopedReference): Promise<ContactResult>;
  saveContact(payload: SaveContactPayload): Promise<ContactResult>;
  archiveContactByRemoteId(
    reference: ContactScopedReference,
  ): Promise<ContactOperationResult>;
}
