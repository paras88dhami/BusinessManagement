import { describe, expect, it, vi } from "vitest";
import { createGetOrCreateContactUseCase } from "@/feature/contacts/useCase/getOrCreateContact.useCase.impl";
import type { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { ContactType } from "@/feature/contacts/types/contact.types";

describe("getOrCreateContact.useCase", () => {
  it("reuses an existing contact by normalized phone before name fallback", async () => {
    const existingContact = {
      remoteId: "contact-1",
      ownerUserRemoteId: "user-1",
      accountRemoteId: "business-1",
      accountType: AccountType.Business,
      contactType: ContactType.Customer,
      fullName: "Old Name",
      phoneNumber: "+977 9812345678",
      emailAddress: null,
      address: null,
      taxId: null,
      openingBalanceAmount: 0,
      openingBalanceDirection: null,
      notes: null,
      isArchived: false,
      createdAt: 1,
      updatedAt: 1,
    };

    const repository = {
      getContactsByAccountRemoteId: vi.fn(async () => ({
        success: true as const,
        value: [existingContact],
      })),
      saveContact: vi.fn(),
    } as unknown as ContactRepository;

    const useCase = createGetOrCreateContactUseCase(repository);

    const result = await useCase.execute({
      accountRemoteId: "business-1",
      accountType: AccountType.Business,
      contactType: ContactType.Customer,
      fullName: "New Typed Name",
      ownerUserRemoteId: "user-1",
      phoneNumber: "+977-9812345678",
      emailAddress: null,
      address: null,
      taxId: null,
      openingBalanceAmount: 0,
      openingBalanceDirection: null,
      notes: null,
      isArchived: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.remoteId).toBe("contact-1");
    }
    expect(repository.saveContact).not.toHaveBeenCalled();
  });
});
