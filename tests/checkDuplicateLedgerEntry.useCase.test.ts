import { LedgerEntryType } from "@/feature/ledger/types/ledger.entity.types";
import { createCheckDuplicateLedgerEntryUseCase } from "@/feature/ledger/useCase/checkDuplicateLedgerEntry.useCase.impl";
import { describe, expect, it } from "vitest";

describe("checkDuplicateLedgerEntry.useCase", () => {
  const useCase = createCheckDuplicateLedgerEntryUseCase();

  const baseEntry = {
    remoteId: "entry-1",
    businessAccountRemoteId: "biz-1",
    ownerUserRemoteId: "user-1",
    partyName: "Acme Corp",
    partyPhone: null,
    contactRemoteId: null,
    entryType: LedgerEntryType.Sale,
    balanceDirection: "receive" as const,
    title: "Invoice",
    amount: 1000,
    currencyCode: "USD",
    note: null,
    happenedAt: 1704067200000, // 2024-01-01
    dueAt: null,
    paymentMode: null,
    referenceNumber: null,
    reminderAt: null,
    attachmentUri: null,
    settledAgainstEntryRemoteId: null,
    linkedDocumentRemoteId: null,
    linkedTransactionRemoteId: null,
    settlementAccountRemoteId: null,
    settlementAccountDisplayNameSnapshot: null,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  };

  it("returns isDuplicate=false when no matching entries exist", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Purchase,
      partyName: "Different Party",
      amount: 500,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(false);
  });

  it("detects duplicate when all criteria match", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 1000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.matchingEntry?.remoteId).toBe("entry-1");
  });

  it("normalizes party name case-insensitively", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "ACME CORP",
      amount: 1000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(true);
  });

  it("normalizes party name with whitespace", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "  Acme Corp  ",
      amount: 1000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(true);
  });

  it("returns isDuplicate=false when entry type differs", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Purchase,
      partyName: "Acme Corp",
      amount: 1000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(false);
  });

  it("returns isDuplicate=false when amount differs", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 2000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(false);
  });

  it("returns isDuplicate=false when date differs", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 1000,
      happenedAt: 1704153600000, // 2024-01-02
    });

    expect(result.isDuplicate).toBe(false);
  });

  it("excludes the entry being edited", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: "entry-1",
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 1000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(false);
  });

  it("tolerates floating point differences in amount", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 1000.00005,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(true);
  });

  it("rejects amounts outside floating point tolerance", async () => {
    const result = await useCase.execute({
      entries: [baseEntry],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 1000.001,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(false);
  });

  it("finds duplicate among multiple entries", async () => {
    const entry2 = {
      ...baseEntry,
      remoteId: "entry-2",
      partyName: "Different Corp",
    };

    const entry3 = {
      ...baseEntry,
      remoteId: "entry-3",
      partyName: "Another Corp",
      amount: 2000,
    };

    const result = await useCase.execute({
      entries: [entry2, baseEntry, entry3],
      editingRemoteId: null,
      entryType: LedgerEntryType.Sale,
      partyName: "Acme Corp",
      amount: 1000,
      happenedAt: 1704067200000,
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.matchingEntry?.remoteId).toBe("entry-1");
  });
});
