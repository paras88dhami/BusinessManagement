import {
  ContactOperationResult,
  ContactResult,
  ContactsResult,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";

export interface ContactRepository {
  getContactsByAccountRemoteId(accountRemoteId: string): Promise<ContactsResult>;
  getContactByRemoteId(remoteId: string): Promise<ContactResult>;
  saveContact(payload: SaveContactPayload): Promise<ContactResult>;
  archiveContactByRemoteId(remoteId: string): Promise<ContactOperationResult>;
}
