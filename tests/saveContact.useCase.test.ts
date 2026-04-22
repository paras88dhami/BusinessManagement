import { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import {
  Contact,
  ContactBalanceDirection,
  ContactNotFoundError,
  ContactType,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";
import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { createSaveContactUseCase } from "@/feature/contacts/useCase/saveContact.useCase.impl";
import { describe, expect, it, vi } from "vitest";

const buildPayload = (
  overrides: Partial<SaveContactPayload> = {},
): SaveContactPayload => ({
  remoteId: "  contact-1  ",
  ownerUserRemoteId: "  user-1  ",
  accountRemoteId: "  account-1  ",
  accountType: AccountType.Business,
  contactType: ContactType.Customer,
  fullName: "  Kapil Dhami  ",
  phoneNumber: "  9800000000  ",
  emailAddress: "  kapil@example.com  ",
  address: "  Kathmandu  ",
  taxId: "  PAN-1  ",
  openingBalanceAmount: 500,
  openingBalanceDirection: ContactBalanceDirection.Receive,
  notes: "  Regular customer  ",
  isArchived: false,
  ...overrides,
});

const buildContact = (payload: SaveContactPayload): Contact => ({
  remoteId: payload.remoteId,
  ownerUserRemoteId: payload.ownerUserRemoteId,
  accountRemoteId: payload.accountRemoteId,
  accountType: payload.accountType,
  contactType: payload.contactType,
  fullName: payload.fullName,
  phoneNumber: payload.phoneNumber,
  emailAddress: payload.emailAddress,
  address: payload.address,
  taxId: payload.taxId,
  openingBalanceAmount: payload.openingBalanceAmount,
  openingBalanceDirection: payload.openingBalanceDirection,
  notes: payload.notes,
  isArchived: payload.isArchived,
  createdAt: 1,
  updatedAt: 1,
});

const createRepository = (
  saveContactMock: ContactRepository["saveContact"],
): ContactRepository => ({
  getContactsByAccountRemoteId: vi.fn(async () => ({
    success: true as const,
    value: [],
  })),
  getContactByRemoteId: vi.fn(async () => ({
    success: false as const,
    error: ContactNotFoundError,
  })),
  saveContact: saveContactMock,
  archiveContactByRemoteId: vi.fn(async () => ({
    success: true as const,
    value: true,
  })),
});

describe("saveContact.useCase", () => {
  it("rejects blank phone number after trimming", async () => {
    const saveContactMock = vi.fn<ContactRepository["saveContact"]>(
      async () => ({
        success: true as const,
        value: buildContact(buildPayload()),
      }),
    );

    const repository = createRepository(saveContactMock);
    const useCase = createSaveContactUseCase(repository);

    const result = await useCase.execute(
      buildPayload({ phoneNumber: "   " }),
    );

    expect(result.success).toBe(false);
    expect(saveContactMock).not.toHaveBeenCalled();

    if (!result.success) {
      expect(result.error.message).toBe(
        "Phone number is required when creating or editing contacts.",
      );
    }
  });

  it("rejects positive opening balance without direction", async () => {
    const saveContactMock = vi.fn<ContactRepository["saveContact"]>(
      async () => ({
        success: true as const,
        value: buildContact(buildPayload()),
      }),
    );

    const repository = createRepository(saveContactMock);
    const useCase = createSaveContactUseCase(repository);

    const result = await useCase.execute(
      buildPayload({
        openingBalanceAmount: 500,
        openingBalanceDirection: null,
      }),
    );

    expect(result.success).toBe(false);
    expect(saveContactMock).not.toHaveBeenCalled();

    if (!result.success) {
      expect(result.error.message).toBe(
        "Opening balance direction is required when opening balance amount is greater than zero.",
      );
    }
  });

  it("normalizes trimmed payload values before saving", async () => {
    const saveContactMock = vi.fn<ContactRepository["saveContact"]>(
      async (payload) => ({
        success: true as const,
        value: buildContact(payload),
      }),
    );

    const repository = createRepository(saveContactMock);
    const useCase = createSaveContactUseCase(repository);

    const result = await useCase.execute(buildPayload());

    expect(result.success).toBe(true);
    expect(saveContactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        remoteId: "contact-1",
        ownerUserRemoteId: "user-1",
        accountRemoteId: "account-1",
        fullName: "Kapil Dhami",
        phoneNumber: "9800000000",
        emailAddress: "kapil@example.com",
        address: "Kathmandu",
        taxId: "PAN-1",
        notes: "Regular customer",
      }),
    );
  });
});
