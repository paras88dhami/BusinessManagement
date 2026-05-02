import { createGetContactHistoryReadModelUseCase } from "@/shared/readModel/contactHistory/useCase/getContactHistoryReadModel.useCase.impl";
import {
  ContactHistoryAmountTone,
  ContactHistoryEventType,
} from "@/shared/readModel/contactHistory/types/contactHistory.readModel.types";
import { describe, expect, it, vi } from "vitest";

const buildReadModel = (overrides: Record<string, unknown> = {}) => ({
  accountRemoteId: "business-1",
  contactRemoteId: "contact-1",
  summary: {
    totalMoneyIn: 100,
    totalMoneyOut: 20,
    openBillingDocumentCount: 1,
    ledgerEntryCount: 2,
    orderCount: 1,
    posSaleCount: 1,
    timelineItemCount: 2,
  },
  timelineItems: [
    {
      id: "transaction:txn-1",
      sourceRemoteId: "txn-1",
      eventType: ContactHistoryEventType.Transaction,
      title: "Cash Sale",
      subtitle: "Cash",
      occurredAt: 1_710_000_000_000,
      amount: 100,
      amountTone: ContactHistoryAmountTone.Positive,
      statusLabel: "posted",
    },
    {
      id: "billing:bill-1",
      sourceRemoteId: "bill-1",
      eventType: ContactHistoryEventType.BillingDocument,
      title: "INV-001",
      subtitle: "Kapil Customer",
      occurredAt: 1_709_000_000_000,
      amount: 50,
      amountTone: ContactHistoryAmountTone.Positive,
      statusLabel: "pending",
    },
  ],
  ...overrides,
});

describe("getContactHistoryReadModel.useCase", () => {
  it("rejects blank account remote id", async () => {
    const repository = {
      getContactHistoryReadModel: vi.fn(),
    };

    const useCase = createGetContactHistoryReadModelUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      accountRemoteId: "   ",
      contactRemoteId: "contact-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain(
        "An active account is required to load contact history.",
      );
    }
    expect(repository.getContactHistoryReadModel).not.toHaveBeenCalled();
  });

  it("rejects blank contact remote id", async () => {
    const repository = {
      getContactHistoryReadModel: vi.fn(),
    };

    const useCase = createGetContactHistoryReadModelUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      accountRemoteId: "business-1",
      contactRemoteId: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain(
        "A contact id is required to load contact history.",
      );
    }
    expect(repository.getContactHistoryReadModel).not.toHaveBeenCalled();
  });

  it("normalizes ids and applies the default timeline limit", async () => {
    const repository = {
      getContactHistoryReadModel: vi.fn(async (query) => ({
        success: true as const,
        value: buildReadModel(query),
      })),
    };

    const useCase = createGetContactHistoryReadModelUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      accountRemoteId: " business-1 ",
      contactRemoteId: " contact-1 ",
    });

    expect(result.success).toBe(true);
    expect(repository.getContactHistoryReadModel).toHaveBeenCalledWith({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
      timelineLimit: 50,
    });
  });

  it("preserves the explicit timeline limit", async () => {
    const repository = {
      getContactHistoryReadModel: vi.fn(async (query) => ({
        success: true as const,
        value: buildReadModel(query),
      })),
    };

    const useCase = createGetContactHistoryReadModelUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
      timelineLimit: 10,
    });

    expect(result.success).toBe(true);
    expect(repository.getContactHistoryReadModel).toHaveBeenCalledWith({
      accountRemoteId: "business-1",
      contactRemoteId: "contact-1",
      timelineLimit: 10,
    });
  });
});

