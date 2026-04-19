import {
  ContactOperationResult,
  ContactScopedReference,
} from "@/feature/contacts/types/contact.types";

export interface ArchiveContactUseCase {
  execute(reference: ContactScopedReference): Promise<ContactOperationResult>;
}
