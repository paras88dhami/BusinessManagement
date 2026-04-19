import { describe, expect, it, vi } from "vitest";
import { createSaveContactUseCase } from "@/feature/contacts/useCase/saveContact.useCase.impl";
import type { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";
import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import { ContactType } from "@/feature/contacts/types/contact.types";

describe("saveContact.useCase", () => {
  it("requires phone number for contacts save flow", async () => {
    const repository = {
      saveContact: vi.fn(),
    } as unknown as ContactRepository;

    const useCase = createSaveContactUseCase(repository);

    const result = await useCase.execute({
      remoteId: "contact-1",
      ownerUserRemoteId: "user-1",
      accountRemoteId: "account-1",
      accountType: AccountType.Business,
      contactType: ContactType.Customer,
      fullName: "Ram Traders",
      phoneNumber: null,
      emailAddress: null,
      address: null,
      taxId: null,
      openingBalanceAmount: 0,
      openingBalanceDirection: null,
      notes: null,
      isArchived: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Phone number is required");
    }
    expect(repository.saveContact).not.toHaveBeenCalled();
  });
});
