import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import { ContactValidationError, ContactsResult } from "@/feature/contacts/types/contact.types";
import { GetContactsUseCase } from "./getContacts.useCase";

class GetContactsUseCaseImpl implements GetContactsUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(params: { accountRemoteId: string }): Promise<ContactsResult> {
    const normalizedAccountRemoteId = params.accountRemoteId.trim();
    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: ContactValidationError("An active account is required to load contacts."),
      };
    }

    return this.repository.getContactsByAccountRemoteId(normalizedAccountRemoteId);
  }
}

export const createGetContactsUseCase = (
  repository: ContactRepository,
): GetContactsUseCase => new GetContactsUseCaseImpl(repository);
