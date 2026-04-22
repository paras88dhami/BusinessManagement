import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
  ContactBalanceDirection,
  ContactResult,
  ContactValidationError,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";
import { SaveContactUseCase } from "./saveContact.useCase";

const normalizeRequired = (value: string): string => value.trim();

const normalizeOptional = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const ALLOWED_DIRECTION_SET = new Set([
  ContactBalanceDirection.Receive,
  ContactBalanceDirection.Pay,
]);

class SaveContactUseCaseImpl implements SaveContactUseCase {
  constructor(private readonly repository: ContactRepository) {}

  async execute(payload: SaveContactPayload): Promise<ContactResult> {
    const normalizedRemoteId = normalizeRequired(payload.remoteId);
    const normalizedOwnerUserRemoteId = normalizeRequired(
      payload.ownerUserRemoteId,
    );
    const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
    const normalizedFullName = normalizeRequired(payload.fullName);
    const normalizedPhoneNumber = normalizeOptional(payload.phoneNumber);
    const normalizedEmailAddress = normalizeOptional(payload.emailAddress);
    const normalizedAddress = normalizeOptional(payload.address);
    const normalizedTaxId = normalizeOptional(payload.taxId);
    const normalizedNotes = normalizeOptional(payload.notes);
    const openingBalanceAmount = payload.openingBalanceAmount;
    const openingBalanceDirection = payload.openingBalanceDirection;

    if (!normalizedRemoteId) {
      return {
        success: false,
        error: ContactValidationError("Remote id is required."),
      };
    }

    if (!normalizedOwnerUserRemoteId) {
      return {
        success: false,
        error: ContactValidationError("Owner user remote id is required."),
      };
    }

    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: ContactValidationError("Account remote id is required."),
      };
    }

    if (!normalizedFullName) {
      return {
        success: false,
        error: ContactValidationError("Full name is required."),
      };
    }

    if (!normalizedPhoneNumber) {
      return {
        success: false,
        error: ContactValidationError(
          "Phone number is required when creating or editing contacts.",
        ),
      };
    }

    if (!Number.isFinite(openingBalanceAmount) || openingBalanceAmount < 0) {
      return {
        success: false,
        error: ContactValidationError(
          "Opening balance amount must be zero or greater.",
        ),
      };
    }

    if (openingBalanceAmount === 0 && openingBalanceDirection !== null) {
      return {
        success: false,
        error: ContactValidationError(
          "Opening balance direction must be empty when opening balance amount is zero.",
        ),
      };
    }

    if (
      openingBalanceAmount > 0 &&
      (!openingBalanceDirection ||
        !ALLOWED_DIRECTION_SET.has(openingBalanceDirection))
    ) {
      return {
        success: false,
        error: ContactValidationError(
          "Opening balance direction is required when opening balance amount is greater than zero.",
        ),
      };
    }

    return this.repository.saveContact({
      ...payload,
      remoteId: normalizedRemoteId,
      ownerUserRemoteId: normalizedOwnerUserRemoteId,
      accountRemoteId: normalizedAccountRemoteId,
      fullName: normalizedFullName,
      phoneNumber: normalizedPhoneNumber,
      emailAddress: normalizedEmailAddress,
      address: normalizedAddress,
      taxId: normalizedTaxId,
      notes: normalizedNotes,
    });
  }
}

export const createSaveContactUseCase = (
  repository: ContactRepository,
): SaveContactUseCase => new SaveContactUseCaseImpl(repository);
