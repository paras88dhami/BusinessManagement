import {
  ContactResult,
  ContactScopedReference,
} from "@/feature/contacts/types/contact.types";

export interface GetContactByRemoteIdUseCase {
  execute(reference: ContactScopedReference): Promise<ContactResult>;
}
