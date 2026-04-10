import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
    ContactResult,
    ContactValidationError,
} from "@/feature/contacts/types/contact.types";
import {
    GetOrCreateContactPayload,
    GetOrCreateContactUseCase,
} from "./getOrCreateContact.useCase";

const normalizeContactName = (value: string): string =>
  value.trim().toLowerCase();

const createContactRemoteId = (): string => {
  return `con-auto-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

class GetOrCreateContactUseCaseImpl implements GetOrCreateContactUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(payload: GetOrCreateContactPayload): Promise<ContactResult> {
    const accountRemoteId = payload.accountRemoteId.trim();
    const fullName = payload.fullName.trim();
    const ownerUserRemoteId = payload.ownerUserRemoteId.trim();

    if (!accountRemoteId) {
      return {
        success: false,
        error: ContactValidationError(
          "An account is required to resolve a contact.",
        ),
      };
    }

    if (!fullName) {
      return {
        success: false,
        error: ContactValidationError("A contact name is required."),
      };
    }

    if (!ownerUserRemoteId) {
      return {
        success: false,
        error: ContactValidationError(
          "A user is required to resolve a contact.",
        ),
      };
    }

    const contactsResult =
      await this.repository.getContactsByAccountRemoteId(accountRemoteId);

    if (!contactsResult.success) {
      return contactsResult;
    }

    const existingContact = contactsResult.value.find(
      (contact) =>
        contact.contactType === payload.contactType &&
        normalizeContactName(contact.fullName) ===
          normalizeContactName(fullName),
    );

    if (existingContact) {
      return { success: true, value: existingContact };
    }

    return this.repository.saveContact({
      remoteId: createContactRemoteId(),
      ownerUserRemoteId,
      accountRemoteId,
      accountType: payload.accountType,
      contactType: payload.contactType,
      fullName,
      phoneNumber: payload.phoneNumber ?? null,
      emailAddress: payload.emailAddress ?? null,
      address: payload.address ?? null,
      taxId: payload.taxId ?? null,
      openingBalanceAmount: payload.openingBalanceAmount ?? 0,
      openingBalanceDirection: payload.openingBalanceDirection ?? null,
      notes: payload.notes ?? null,
      isArchived: payload.isArchived ?? false,
    });
  }
}

export const createGetOrCreateContactUseCase = (
  repository: ContactRepository,
): GetOrCreateContactUseCase => new GetOrCreateContactUseCaseImpl(repository);
