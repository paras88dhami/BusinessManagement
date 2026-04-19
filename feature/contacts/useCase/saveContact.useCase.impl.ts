import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
  ContactResult,
  ContactValidationError,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";
import { SaveContactUseCase } from "./saveContact.useCase";

class SaveContactUseCaseImpl implements SaveContactUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(payload: SaveContactPayload): Promise<ContactResult> {
    if (!payload.ownerUserRemoteId.trim()) {
      return {
        success: false,
        error: ContactValidationError("Owner user remote id is required."),
      };
    }
    if (!payload.accountRemoteId.trim()) {
      return {
        success: false,
        error: ContactValidationError("Account remote id is required."),
      };
    }
    if (!payload.fullName.trim()) {
      return {
        success: false,
        error: ContactValidationError("Full name is required."),
      };
    }

    const normalizedPhoneNumber = payload.phoneNumber?.trim() ?? "";
    if (!normalizedPhoneNumber) {
      return {
        success: false,
        error: ContactValidationError(
          "Phone number is required when creating or editing contacts.",
        ),
      };
    }

    return this.repository.saveContact({
      ...payload,
      phoneNumber: normalizedPhoneNumber,
    });
  }
}

export const createSaveContactUseCase = (
  repository: ContactRepository,
): SaveContactUseCase => new SaveContactUseCaseImpl(repository);
