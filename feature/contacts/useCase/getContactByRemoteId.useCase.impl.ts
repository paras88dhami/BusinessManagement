import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
  ContactResult,
  ContactScopedReference,
  ContactValidationError,
} from "@/feature/contacts/types/contact.types";
import { GetContactByRemoteIdUseCase } from "./getContactByRemoteId.useCase";

class GetContactByRemoteIdUseCaseImpl implements GetContactByRemoteIdUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(reference: ContactScopedReference): Promise<ContactResult> {
    const normalizedRemoteId = reference.remoteId.trim();
    const normalizedAccountRemoteId = reference.accountRemoteId.trim();

    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: ContactValidationError(
          "An active account is required to load the contact.",
        ),
      };
    }

    if (!normalizedRemoteId) {
      return {
        success: false,
        error: ContactValidationError("A contact id is required."),
      };
    }

    return this.repository.getContactByRemoteId({
      remoteId: normalizedRemoteId,
      accountRemoteId: normalizedAccountRemoteId,
    });
  }
}

export const createGetContactByRemoteIdUseCase = (
  repository: ContactRepository,
): GetContactByRemoteIdUseCase =>
  new GetContactByRemoteIdUseCaseImpl(repository);
