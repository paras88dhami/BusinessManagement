import { ContactsResult } from "@/feature/contacts/types/contact.types";

export interface GetContactsUseCase {
  execute(params: { accountRemoteId: string }): Promise<ContactsResult>;
}
