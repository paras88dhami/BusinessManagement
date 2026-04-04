import { ContactOperationResult } from "@/feature/contacts/types/contact.types";

export interface ArchiveContactUseCase {
  execute(remoteId: string): Promise<ContactOperationResult>;
}
