import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
  ContactOperationResult,
  ContactScopedReference,
  ContactValidationError,
} from "@/feature/contacts/types/contact.types";
import { ArchiveContactUseCase } from "./archiveContact.useCase";

class ArchiveContactUseCaseImpl implements ArchiveContactUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(
    reference: ContactScopedReference,
  ): Promise<ContactOperationResult> {
    const normalizedRemoteId = reference.remoteId.trim();
    const normalizedAccountRemoteId = reference.accountRemoteId.trim();

    if (!normalizedRemoteId) {
      return {
        success: false,
        error: ContactValidationError("Contact remote id is required."),
      };
    }

    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: ContactValidationError("Account remote id is required."),
      };
    }

    return this.repository.archiveContactByRemoteId({
      remoteId: normalizedRemoteId,
      accountRemoteId: normalizedAccountRemoteId,
    });
  }
}

export const createArchiveContactUseCase = (
  repository: ContactRepository,
): ArchiveContactUseCase => new ArchiveContactUseCaseImpl(repository);
