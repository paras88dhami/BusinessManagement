import {
  ContactScopedReference,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";
import { Result } from "@/shared/types/result.types";
import { ContactModel } from "./db/contact.model";

export interface ContactDatasource {
  saveContact(payload: SaveContactPayload): Promise<Result<ContactModel>>;
  getContactsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ContactModel[]>>;
  getContactByRemoteId(
    reference: ContactScopedReference,
  ): Promise<Result<ContactModel>>;
  archiveContactByRemoteId(
    reference: ContactScopedReference,
  ): Promise<Result<boolean>>;
}
