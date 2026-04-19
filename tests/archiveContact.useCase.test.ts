import { describe, expect, it, vi } from "vitest";
import { createArchiveContactUseCase } from "@/feature/contacts/useCase/archiveContact.useCase.impl";
import type { ContactRepository } from "@/feature/contacts/data/repository/contact.repository";

describe("archiveContact.useCase", () => {
  it("requires account remote id", async () => {
    const repository = {
      archiveContactByRemoteId: vi.fn(),
    } as unknown as ContactRepository;

    const useCase = createArchiveContactUseCase(repository);

    const result = await useCase.execute({
      remoteId: "contact-1",
      accountRemoteId: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Account remote id is required");
    }
    expect(repository.archiveContactByRemoteId).not.toHaveBeenCalled();
  });

  it("forwards scoped reference to repository", async () => {
    const repository = {
      archiveContactByRemoteId: vi.fn(async () => ({
        success: true as const,
        value: true,
      })),
    } as unknown as ContactRepository;

    const useCase = createArchiveContactUseCase(repository);

    const result = await useCase.execute({
      remoteId: "contact-1",
      accountRemoteId: "account-1",
    });

    expect(result.success).toBe(true);
    expect(repository.archiveContactByRemoteId).toHaveBeenCalledWith({
      remoteId: "contact-1",
      accountRemoteId: "account-1",
    });
  });
});
