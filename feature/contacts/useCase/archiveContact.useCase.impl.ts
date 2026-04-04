import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
  ContactOperationResult,
  ContactValidationError,
} from "@/feature/contacts/types/contact.types";
import { ArchiveContactUseCase } from "./archiveContact.useCase";

class ArchiveContactUseCaseImpl implements ArchiveContactUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(remoteId: string): Promise<ContactOperationResult> {
    const normalizedRemoteId = remoteId.trim();
    if (!normalizedRemoteId) {
      return {
        success: false,
        error: ContactValidationError("Contact remote id is required."),
      };
    }

    return this.repository.archiveContactByRemoteId(normalizedRemoteId);
  }
}

export const createArchiveContactUseCase = (
  repository: ContactRepository,
): ArchiveContactUseCase => new ArchiveContactUseCaseImpl(repository);
